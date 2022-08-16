import { useCallback, useState, useEffect } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import { Call } from 'starknet'
import { uint256HexFromStrHex } from '@rulesorg/sdk-core'

import Modal, { ModalHeader } from '@/components/Modal'
import { useModalOpen, useOfferModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import Column from '@/components/Column'
import Offer from './Offer'
import Confirmation from './Confirmation'
import { TYPE } from '@/styles/theme'
import StarknetSigner from '@/components/StarknetSigner'
import { useCurrentUser } from '@/state/user/hooks'
import { RULES_TOKENS_ADDRESSES } from '@/constants/addresses'
import { networkId } from '@/constants/networks'

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
  serialNumber: number
  tokenId: string
}

export default function OfferModal({ artistName, season, scarcityName, serialNumber, tokenId }: OfferModalProps) {
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
          0, // data len
          0, // data
        ],
      })
    },
    [tokenId, currentUser?.starknetWallet.address]
  )

  // transaction waiting
  const [waitingForTx, setWaitingForTx] = useState(false)
  const onConfirmation = useCallback(() => setWaitingForTx(true), [])

  // hash
  const [txHash, setTxHash] = useState<string | null>(null)
  const onTransaction = useCallback((hash: string) => setTxHash(hash), [])

  // error
  const [error, setError] = useState<string | null>(null)
  const onError = useCallback((error: string) => setError(error), [])

  // on close modal
  useEffect(() => {
    if (isOpen) {
      setCall(null)
      setError(null)
      setTxHash(null)
      setWaitingForTx(false)
    }
  }, [isOpen])

  return (
    <Modal onDismiss={toggleOfferModal} isOpen={isOpen}>
      <DummyFocusInput type="text" />
      <StyledOfferModal gap={26}>
        <ModalHeader onDismiss={toggleOfferModal}>
          {txHash || waitingForTx ? (
            <div />
          ) : (
            <TYPE.large>
              <Trans>Offer this {artistName}</Trans>
              <span> </span>
              <Trans>season</Trans>
              <span> </span>
              {season}
              <span> </span>
              <Trans id={scarcityName} render={({ translation }) => <>translation</>} />
              <span> </span>#{serialNumber}
            </TYPE.large>
          )}
        </ModalHeader>
        {txHash || waitingForTx ? (
          <Confirmation txHash={txHash ?? undefined} error={error ?? undefined} />
        ) : call ? (
          <StarknetSigner onConfirmation={onConfirmation} onTransaction={onTransaction} onError={onError} call={call} />
        ) : (
          <Offer onRecipientSelected={onRecipientSelected} />
        )}
      </StyledOfferModal>
    </Modal>
  )
}
