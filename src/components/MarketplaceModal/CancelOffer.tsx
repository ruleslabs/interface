import { useState, useCallback, useEffect, useMemo } from 'react'
import { t, Trans } from '@lingui/macro'
import { uint256HexFromStrHex, getStarknetCardId, ScarcityName } from '@rulesorg/sdk-core'
import { ApolloError } from '@apollo/client'
import { Call, Signature } from 'starknet'

import ClassicModal, { ModalContent } from '@/components/Modal/Classic'
import { useModalOpen, useCancelOfferModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { useCurrentUser } from '@/state/user/hooks'
import Column from '@/components/Column'
import { PrimaryButton } from '@/components/Button'
import { ErrorCard } from '@/components/Card'
import LockedWallet from '@/components/LockedWallet'
import StarknetSigner from '@/components/StarknetSigner'
import { MARKETPLACE_ADDRESSES } from '@/constants/addresses'
import { useCancelOfferMutation } from '@/state/wallet/hooks'
import { networkId } from '@/constants/networks'
import CardBreakdown from './CardBreakdown'

interface CancelOfferModalProps {
  artistName: string
  season: number
  scarcityName: string
  scarcityMaxSupply?: number
  serialNumber: number
  pictureUrl: string
  onSuccess(): void
}

export default function CancelOfferModal({
  artistName,
  season,
  scarcityName,
  scarcityMaxSupply,
  serialNumber,
  pictureUrl,
  onSuccess,
}: CancelOfferModalProps) {
  // current user
  const currentUser = useCurrentUser()

  // token id
  const tokenId: string = useMemo(
    () => getStarknetCardId(artistName, season, ScarcityName.indexOf(scarcityName), serialNumber),
    [artistName, season, scarcityName, serialNumber]
  )

  // modal
  const isOpen = useModalOpen(ApplicationModal.CANCEL_OFFER)
  const toggleCancelOfferModal = useCancelOfferModalToggle()

  // call
  const [calls, setCalls] = useState<Call[] | null>(null)
  const handleConfirmation = useCallback(() => {
    const uint256TokenId = uint256HexFromStrHex(tokenId)

    setCalls([
      {
        contractAddress: MARKETPLACE_ADDRESSES[networkId],
        entrypoint: 'cancelOffer',
        calldata: [uint256TokenId.low, uint256TokenId.high],
      },
    ])
  }, [tokenId])

  // error
  const [error, setError] = useState<string | null>(null)
  const onError = useCallback((error: string) => setError(error), [])

  // signature
  const [cancelOfferMutation] = useCancelOfferMutation()
  const [txHash, setTxHash] = useState<string | null>(null)

  const onSignature = useCallback(
    (signature: Signature, maxFee: string, nonce: string) => {
      cancelOfferMutation({
        variables: { tokenId, maxFee, nonce, signature: JSON.stringify(signature) },
      })
        .then((res?: any) => {
          const hash = res?.data?.cancelOffer?.hash
          if (!hash) {
            onError('Transaction not received')
            return
          }

          setTxHash(hash)
          onSuccess()
        })
        .catch((cancelOfferError: ApolloError) => {
          const error = cancelOfferError?.graphQLErrors?.[0]
          onError(error?.message ?? 'Transaction not received')

          console.error(error)
        })
    },
    [tokenId, onSuccess]
  )

  // on close modal
  useEffect(() => {
    if (isOpen) {
      setCalls(null)
      setTxHash(null)
      setError(null)
    }
  }, [isOpen])

  return (
    <ClassicModal onDismiss={toggleCancelOfferModal} isOpen={isOpen}>
      <ModalContent>
        <StarknetSigner
          modalHeaderChildren={t`Confirm offer cancelation`}
          confirmationText={t`Your offer will be canceled`}
          confirmationActionText={t`Confirm offer cancelation`}
          transactionText={t`offer cancelation.`}
          calls={calls ?? undefined}
          txHash={txHash ?? undefined}
          error={error ?? undefined}
          onDismiss={toggleCancelOfferModal}
          onSignature={onSignature}
          onError={onError}
        >
          <Column gap={32}>
            <CardBreakdown
              pictureUrl={pictureUrl}
              season={season}
              artistName={artistName}
              serialNumbers={[serialNumber]}
              scarcityName={scarcityName}
            />

            {!!currentUser?.starknetWallet.lockingReason && (
              <ErrorCard>
                <LockedWallet />
              </ErrorCard>
            )}

            <PrimaryButton onClick={handleConfirmation} disabled={!!currentUser?.starknetWallet.lockingReason} large>
              <Trans>Next</Trans>
            </PrimaryButton>
          </Column>
        </StarknetSigner>
      </ModalContent>
    </ClassicModal>
  )
}
