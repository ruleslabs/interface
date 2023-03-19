import JSBI from 'jsbi'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { t, Trans } from '@lingui/macro'
import { uint256HexFromStrHex, getStarknetCardId, ScarcityName } from '@rulesorg/sdk-core'
import { ApolloError } from '@apollo/client'
import { Call, Signature } from 'starknet'

import ClassicModal, { ModalContent } from '@/components/Modal/Classic'
import { useModalOpen, useAcceptOfferModalToggle, useWalletModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { useCurrentUser } from '@/state/user/hooks'
import Column from '@/components/Column'
import { PrimaryButton } from '@/components/Button'
import { ErrorCard } from '@/components/Card'
import LockedWallet from '@/components/LockedWallet'
import StarknetSigner from '@/components/StarknetSigner'
import { ETH_ADDRESSES, MARKETPLACE_ADDRESSES } from '@/constants/addresses'
import { networkId } from '@/constants/networks'
import { useETHBalances, useAcceptOffersMutation } from '@/state/wallet/hooks'
import { PurchaseBreakdown } from './PriceBreakdown'
import CardBreakdown from './CardBreakdown'

interface AcceptOfferModalProps {
  artistName: string
  season: number
  scarcityName: string
  serialNumbers: number[]
  pictureUrl: string
  price: string
  onSuccess(): void
}

export default function AcceptOfferModal({
  artistName,
  season,
  scarcityName,
  serialNumbers,
  pictureUrl,
  price,
  onSuccess,
}: AcceptOfferModalProps) {
  // current user
  const currentUser = useCurrentUser()

  // tokens ids
  const tokenIds = useMemo(
    () =>
      serialNumbers.map((serialNumber) =>
        getStarknetCardId(artistName, season, ScarcityName.indexOf(scarcityName), serialNumber)
      ),
    [artistName, season, scarcityName, serialNumbers.length]
  )

  // modal
  const isOpen = useModalOpen(ApplicationModal.ACCEPT_OFFER)
  const toggleAcceptOfferModal = useAcceptOfferModalToggle()
  const toggleWalletModal = useWalletModalToggle()

  // balance
  const balance = useETHBalances([currentUser?.starknetWallet.address])[currentUser?.starknetWallet.address]

  // can pay for card
  const canPayForCard = useMemo(() => {
    if (!balance) return false

    return JSBI.greaterThanOrEqual(balance.quotient, JSBI.BigInt(price))
  }, [balance, price])

  // call
  const [calls, setCalls] = useState<Call[] | null>(null)
  const handleConfirmation = useCallback(() => {
    setCalls([
      {
        contractAddress: ETH_ADDRESSES[networkId],
        entrypoint: 'increaseAllowance',
        calldata: [MARKETPLACE_ADDRESSES[networkId], price, 0],
      },
      ...tokenIds.map((tokenId) => {
        const uint256TokenId = uint256HexFromStrHex(tokenId)

        return {
          contractAddress: MARKETPLACE_ADDRESSES[networkId],
          entrypoint: 'acceptOffer',
          calldata: [uint256TokenId.low, uint256TokenId.high],
        }
      }),
    ])
  }, [tokenIds.length])

  // error
  const [error, setError] = useState<string | null>(null)
  const onError = useCallback((error: string) => setError(error), [])

  // signature
  const [acceptOffersMutation] = useAcceptOffersMutation()
  const [txHash, setTxHash] = useState<string | null>(null)

  const onSignature = useCallback(
    (signature: Signature, maxFee: string, nonce: string) => {
      acceptOffersMutation({
        variables: { tokenIds, maxFee, nonce, signature: JSON.stringify(signature) },
      })
        .then((res?: any) => {
          const hash = res?.data?.acceptOffers?.hash
          if (!hash) {
            onError('Transaction not received')
            return
          }

          setTxHash(hash)
          onSuccess()
        })
        .catch((acceptOfferError: ApolloError) => {
          const error = acceptOfferError?.graphQLErrors?.[0]
          onError(error?.message ?? 'Transaction not received')

          console.error(error)
        })
    },
    [tokenIds.length, onSuccess]
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
    <ClassicModal onDismiss={toggleAcceptOfferModal} isOpen={isOpen}>
      <ModalContent>
        <StarknetSigner
          modalHeaderChildren={t`Confirm purchase`}
          confirmationText={t`Your purchase will be accepted`}
          confirmationActionText={t`Confirm purchase`}
          transactionText={t`offer acceptance.`}
          transactionValue={price}
          calls={calls ?? undefined}
          txHash={txHash ?? undefined}
          error={error ?? undefined}
          onDismiss={toggleAcceptOfferModal}
          onSignature={onSignature}
          onError={onError}
        >
          <Column gap={32}>
            <CardBreakdown
              pictureUrl={pictureUrl}
              season={season}
              artistName={artistName}
              serialNumbers={serialNumbers}
              scarcityName={scarcityName}
            />

            <PurchaseBreakdown price={price} />

            {!!currentUser?.starknetWallet.lockingReason && (
              <ErrorCard>
                <LockedWallet />
              </ErrorCard>
            )}

            {!canPayForCard && balance && (
              <ErrorCard textAlign="center">
                <Trans>
                  You do not have enough ETH in your Rules wallet to purchase this card.
                  <br />
                  <span onClick={toggleWalletModal}>Buy ETH or deposit from another wallet.</span>
                </Trans>
              </ErrorCard>
            )}

            <PrimaryButton
              onClick={handleConfirmation}
              disabled={!!currentUser?.starknetWallet.lockingReason || !canPayForCard}
              large
            >
              <Trans>Next</Trans>
            </PrimaryButton>
          </Column>
        </StarknetSigner>
      </ModalContent>
    </ClassicModal>
  )
}
