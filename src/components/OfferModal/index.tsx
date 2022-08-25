import { useCallback, useState, useEffect } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import { Signature, Call } from 'starknet'
import { uint256HexFromStrHex } from '@rulesorg/sdk-core'
import { ApolloError } from '@apollo/client'

import Modal, { ModalHeader } from '@/components/Modal'
import { useModalOpen, useOfferModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import Column from '@/components/Column'
import Offer from './Offer'
import Confirmation from './Confirmation'
import StarknetSigner from '@/components/StarknetSigner'
import { useCurrentUser } from '@/state/user/hooks'
import { RULES_TOKENS_ADDRESSES } from '@/constants/addresses'
import { networkId } from '@/constants/networks'
import { useTransferCardMutation } from '@/state/wallet/hooks'

const DummyFocusInput = styled.input`
  max-height: 0;
  max-width: 0;
  position: fixed;
  left: 99999px;
`

const StyledOfferModal = styled(Column)`
  width: 546px;
  padding: 26px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 4px;

  ${({ theme }) => theme.media.medium`
    width: 100%;
    height: 100%;
  `}
`

interface OfferModalProps {
  artistName: string
  season: number
  scarcityName: string
  scarcityMaxSupply?: number
  serialNumber: number
  pictureUrl: string
  tokenId: string
}

export default function OfferModal({
  artistName,
  season,
  scarcityName,
  scarcityMaxSupply,
  serialNumber,
  tokenId,
  pictureUrl,
}: OfferModalProps) {
  // currentUser
  const currentUser = useCurrentUser()

  // modal
  const isOpen = useModalOpen(ApplicationModal.OFFER)
  const toggleOfferModal = useOfferModalToggle()

  // call
  const [call, setCall] = useState<Call | null>(null)
  const onRecipientSelected = useCallback(
    (address: string) => {
      if (!currentUser.starknetWallet.address) return // to enforce recipient typing

      const uint256TokenId = uint256HexFromStrHex(tokenId)

      setCall({
        contractAddress: RULES_TOKENS_ADDRESSES[networkId],
        entrypoint: 'safeTransferFrom',
        calldata: [
          currentUser.starknetWallet.address,
          address,
          uint256TokenId.low,
          uint256TokenId.high,
          1, // amount.low
          0, // amount.high
          1, // data len
          0, // data
        ],
      })
    },
    [tokenId, currentUser?.starknetWallet.address]
  )

  // fee estimation waiting
  const [waitingForFees, setWaitingForFees] = useState(false)
  const onWaitingForFees = useCallback((waiting: boolean) => setWaitingForFees(waiting), [])

  // transaction waiting
  const [waitingForTx, setWaitingForTx] = useState(false)
  const onConfirmation = useCallback(() => setWaitingForTx(true), [])

  // signature
  const [transferCardMutation] = useTransferCardMutation()
  const [txHash, setTxHash] = useState<string | null>(null)

  const onSignature = useCallback(
    (signature: Signature, maxFee: string) => {
      transferCardMutation({
        variables: {
          tokenId,
          recipientAddress: call.calldata[1],
          maxFee,
          signature: JSON.stringify(signature),
        },
      })
        .then((res?: any) => {
          const hash = res?.data?.transferCard?.hash
          if (!hash) {
            onError('Transaction not received')
            return
          }

          setTxHash(hash)
        })
        .catch((transferCardError: ApolloError) => {
          const error = transferCardError?.graphQLErrors?.[0]
          onError(error?.message ?? 'Transaction not received')

          console.error(error)
        })
    },
    [call?.calldata?.[1], tokenId]
  )

  // error
  const [error, setError] = useState<string | null>(null)
  const onError = useCallback((error: string) => setError(error), [])

  // on close modal
  useEffect(() => {
    if (isOpen) {
      setCall(null)
      setError(null)
      setWaitingForTx(false)
      setTxHash(null)
    }
  }, [isOpen])

  return (
    <Modal onDismiss={toggleOfferModal} isOpen={isOpen}>
      <DummyFocusInput type="text" />
      <StyledOfferModal gap={26}>
        <ModalHeader onDismiss={toggleOfferModal}>
          {txHash || waitingForTx || waitingForFees ? <div /> : t`Offer this card`}
        </ModalHeader>
        {txHash || waitingForTx || waitingForFees ? (
          <Confirmation txHash={txHash ?? undefined} error={error ?? undefined} waitingForFees={waitingForFees} />
        ) : (
          !call && (
            <Offer
              onRecipientSelected={onRecipientSelected}
              artistName={artistName}
              season={season}
              scarcityName={scarcityName}
              scarcityMaxSupply={scarcityMaxSupply}
              serialNumber={serialNumber}
              pictureUrl={pictureUrl}
            />
          )
        )}

        <StarknetSigner
          isOpen={!txHash && !waitingForTx && !waitingForFees && !!call}
          onWaitingForFees={onWaitingForFees}
          onConfirmation={onConfirmation}
          onSignature={onSignature}
          onError={onError}
          call={call ?? undefined}
        />
      </StyledOfferModal>
    </Modal>
  )
}
