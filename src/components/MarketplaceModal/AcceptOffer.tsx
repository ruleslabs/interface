import JSBI from 'jsbi'
import { useState, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { t, Trans } from '@lingui/macro'
import { uint256HexFromStrHex, getStarknetCardId, ScarcityName } from '@rulesorg/sdk-core'
import { ApolloError } from '@apollo/client'
import { Call, Signature } from 'starknet'

import Modal from '@/components/Modal'
import { useModalOpen, useAcceptOfferModalToggle, useDepositModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { useCurrentUser } from '@/state/user/hooks'
import Column from '@/components/Column'
import { RowCenter } from '@/components/Row'
import { TYPE } from '@/styles/theme'
import { PrimaryButton } from '@/components/Button'
import { ErrorCard } from '@/components/Card'
import LockedWallet from '@/components/LockedWallet'
import StarknetSigner from '@/components/StarknetSigner'
import { ETH_ADDRESSES, MARKETPLACE_ADDRESSES } from '@/constants/addresses'
import { useAcceptOfferMutation } from '@/state/wallet/hooks'
import { networkId } from '@/constants/networks'
import { useETHBalances } from '@/state/wallet/hooks'
import { PurchaseBreakdown } from './PriceBreakdown'

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

interface AcceptOfferModalProps {
  artistName: string
  season: number
  scarcityName: string
  scarcityMaxSupply?: number
  serialNumber: number
  pictureUrl: string
  price: string
  onSuccess(): void
}

export default function AcceptOfferModal({
  artistName,
  season,
  scarcityName,
  scarcityMaxSupply,
  serialNumber,
  pictureUrl,
  price,
  onSuccess,
}: AcceptOfferModalProps) {
  // current user
  const currentUser = useCurrentUser()

  // token id
  const tokenId: string = useMemo(
    () => getStarknetCardId(artistName, season, ScarcityName.indexOf(scarcityName), serialNumber),
    [artistName, season, scarcityName, serialNumber]
  )

  // modal
  const isOpen = useModalOpen(ApplicationModal.ACCEPT_OFFER)
  const toggleAcceptOfferModal = useAcceptOfferModalToggle()
  const toggleDepositModal = useDepositModalToggle()

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
    const uint256TokenId = uint256HexFromStrHex(tokenId)

    setCalls([
      {
        contractAddress: ETH_ADDRESSES[networkId],
        entrypoint: 'increaseAllowance',
        calldata: [MARKETPLACE_ADDRESSES[networkId], price, 0],
      },
      {
        contractAddress: MARKETPLACE_ADDRESSES[networkId],
        entrypoint: 'acceptOffer',
        calldata: [uint256TokenId.low, uint256TokenId.high],
      },
    ])
  }, [tokenId])

  // error
  const [error, setError] = useState<string | null>(null)
  const onError = useCallback((error: string) => setError(error), [])

  // signature
  const [acceptOfferMutation] = useAcceptOfferMutation()
  const [txHash, setTxHash] = useState<string | null>(null)

  const onSignature = useCallback(
    (signature: Signature, maxFee: string, nonce: string) => {
      acceptOfferMutation({
        variables: { tokenId, maxFee, nonce, signature: JSON.stringify(signature) },
      })
        .then((res?: any) => {
          const hash = res?.data?.acceptOffer?.hash
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
    <Modal onDismiss={toggleAcceptOfferModal} isOpen={isOpen}>
      <StarknetSigner
        modalHeaderText={t`Confirm purchase`}
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

          <PurchaseBreakdown price={price} />

          {currentUser?.starknetWallet.needsSignerPublicKeyUpdate && (
            <ErrorCard>
              <LockedWallet />
            </ErrorCard>
          )}

          {!canPayForCard && balance && (
            <ErrorCard textAlign="center">
              <Trans>
                You do not have enough ETH in your Rules wallet to purchase this card.
                <br />
                <span onClick={toggleDepositModal}>Buy ETH or deposit from another wallet.</span>
              </Trans>
            </ErrorCard>
          )}

          <PrimaryButton
            onClick={handleConfirmation}
            disabled={currentUser?.starknetWallet.needsSignerPublicKeyUpdate || !canPayForCard}
            large
          >
            <Trans>Next</Trans>
          </PrimaryButton>
        </Column>
      </StarknetSigner>
    </Modal>
  )
}
