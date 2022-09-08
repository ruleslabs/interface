import { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { t, Trans } from '@lingui/macro'
import { uint256HexFromStrHex } from '@rulesorg/sdk-core'
import { ApolloError } from '@apollo/client'

import Modal from '@/components/Modal'
import { useModalOpen, useCreateOfferModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { useCurrentUser } from '@/state/user/hooks'
import Column from '@/components/Column'
import { RowCenter } from '@/components/Row'
import { TYPE } from '@/styles/theme'
import { PrimaryButton } from '@/components/Button'
import { ErrorCard } from '@/components/Card'
import LockedWallet from '@/components/LockedWallet'
import StarknetSigner from '@/components/StarknetSigner'
import { MARKETPLACE_ADDRESSES } from '@/constants/addresses'
import { useCreateOfferMutation } from '@/state/wallet/hooks'
import { networkId } from '@/constants/networks'
import EtherInput from '@/components/Input/EtherInput'

const CardBreakdown = styled(RowCenter)`
  gap: 16px;
  background: ${({ theme }) => theme.bg5};
  width: 100%;
  padding: 12px;

  & img {
    width: 64px;
    border-radius: 4px;
  }
`

interface CreateOfferModalProps {
  artistName: string
  season: number
  scarcityName: string
  scarcityMaxSupply?: number
  serialNumber: number
  pictureUrl: string
  tokenId: string
  onSuccess(): void
}

export default function CreateOfferModal({
  artistName,
  season,
  scarcityName,
  scarcityMaxSupply,
  serialNumber,
  tokenId,
  pictureUrl,
  onSuccess,
}: OfferModalProps) {
  // current user
  const currentUser = useCurrentUser()

  // modal
  const isOpen = useModalOpen(ApplicationModal.CREATE_OFFER)
  const toggleCreateOfferModal = useCreateOfferModalToggle()

  // price
  const [price, setPrice] = useState<string>('')
  const onPriceInput = useCallback((value: string) => setPrice(value), [])

  // call
  const [call, setCall] = useState<Call | null>(null)
  const handleConfirmation = useCallback(() => {
    if (!price || !+price) return

    const uint256TokenId = uint256HexFromStrHex(tokenId)

    setCall({
      contractAddress: MARKETPLACE_ADDRESSES[networkId],
      entrypoint: 'createOffer',
      calldata: [uint256TokenId.low, uint256TokenId.high, price],
    })
  }, [tokenId, price])

  // error
  const [error, setError] = useState<string | null>(null)
  const onError = useCallback((error: string) => setError(error), [])

  // signature
  const [createOfferMutation] = useCreateOfferMutation()
  const [txHash, setTxHash] = useState<string | null>(null)

  const onSignature = useCallback(
    (signature: Signature, maxFee: string) => {
      if (!price) return

      createOfferMutation({ variables: { tokenId, price, maxFee, signature: JSON.stringify(signature) } })
        .then((res?: any) => {
          const hash = res?.data?.createOffer?.hash
          if (!hash) {
            onError('Transaction not received')
            return
          }

          setTxHash(hash)
          onSuccess()
        })
        .catch((createOfferError: ApolloError) => {
          const error = createOfferError?.graphQLErrors?.[0]
          onError(error?.message ?? 'Transaction not received')

          console.error(error)
        })
    },
    [price, tokenId, onSuccess]
  )

  // on close modal
  useEffect(() => {
    if (isOpen) {
      setCall(null)
      setTxHash(null)
      setError(null)
      setPrice('')
    }
  }, [isOpen])

  return (
    <Modal onDismiss={toggleCreateOfferModal} isOpen={isOpen}>
      <StarknetSigner
        modalHeaderText={t`Choose a selling price`}
        confirmationText={t`Your offer will be created`}
        transactionText={t`offer creation.`}
        call={call}
        txHash={txHash}
        error={error}
        onDismiss={toggleCreateOfferModal}
        onSignature={onSignature}
        onError={onError}
      >
        <Column gap={24}>
          <CardBreakdown>
            <img src={pictureUrl} />
            <Column gap={4}>
              <TYPE.body spanColor="text2">
                {artistName} S{season}&nbsp;
                <Trans id={scarcityName} render={({ translation }) => <>{translation}</>} />
              </TYPE.body>
              <TYPE.subtitle>
                #{serialNumber} / {scarcityMaxSupply ?? '4000'}
              </TYPE.subtitle>
            </Column>
          </CardBreakdown>

          {currentUser?.starknetWallet.needsSignerPublicKeyUpdate ? (
            <ErrorCard>
              <LockedWallet />
            </ErrorCard>
          ) : (
            <Column gap={12}>
              <EtherInput onUserInput={onPriceInput} value={price} placeholder="0.0" />
            </Column>
          )}

          <PrimaryButton onClick={handleConfirmation} disabled={!price} large>
            <Trans>Next</Trans>
          </PrimaryButton>
        </Column>
      </StarknetSigner>
    </Modal>
  )
}
