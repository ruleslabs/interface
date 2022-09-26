import { useState, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { t, Trans } from '@lingui/macro'
import { uint256HexFromStrHex, getStarknetCardId, ScarcityName } from '@rulesorg/sdk-core'
import { ApolloError } from '@apollo/client'
import { Call, Signature } from 'starknet'

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
import { MARKETPLACE_ADDRESSES, RULES_TOKENS_ADDRESSES } from '@/constants/addresses'
import { useCreateOfferMutation } from '@/state/wallet/hooks'
import { networkId } from '@/constants/networks'
import EtherInput from '@/components/Input/EtherInput'
import tryParseWeiAmount from '@/utils/tryParseWeiAmount'
import { SaleBreakdown } from './PriceBreakdown'
import { BIG_INT_MIN_MARKETPLACE_OFFER_PRICE, BIG_INT_MAX_MARKETPLACE_OFFER_PRICE } from '@/constants/misc'

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
  onSuccess(): void
}

export default function CreateOfferModal({
  artistName,
  season,
  scarcityName,
  scarcityMaxSupply,
  serialNumber,
  pictureUrl,
  onSuccess,
}: CreateOfferModalProps) {
  // current user
  const currentUser = useCurrentUser()

  // token id
  const tokenId: string = useMemo(
    () => getStarknetCardId(artistName, season, ScarcityName.indexOf(scarcityName), serialNumber),
    [artistName, season, scarcityName, serialNumber]
  )

  // modal
  const isOpen = useModalOpen(ApplicationModal.CREATE_OFFER)
  const toggleCreateOfferModal = useCreateOfferModalToggle()

  // price
  const [price, setPrice] = useState<string>('')
  const parsedPrice = useMemo(() => tryParseWeiAmount(price), [price])

  const onPriceInput = useCallback((value: string) => setPrice(value), [])
  const isPriceValid = useMemo(() => {
    if (!parsedPrice) return false

    return (
      !parsedPrice.lessThan(BIG_INT_MIN_MARKETPLACE_OFFER_PRICE) &&
      !parsedPrice.greaterThan(BIG_INT_MAX_MARKETPLACE_OFFER_PRICE)
    )
  }, [parsedPrice])

  // call
  const [calls, setCalls] = useState<Call[] | null>(null)
  const handleConfirmation = useCallback(() => {
    if (!parsedPrice) return

    const uint256TokenId = uint256HexFromStrHex(tokenId)

    setCalls([
      {
        contractAddress: RULES_TOKENS_ADDRESSES[networkId],
        entrypoint: 'approve',
        calldata: [MARKETPLACE_ADDRESSES[networkId], uint256TokenId.low, uint256TokenId.high, 1, 0],
      },
      {
        contractAddress: MARKETPLACE_ADDRESSES[networkId],
        entrypoint: 'createOffer',
        calldata: [uint256TokenId.low, uint256TokenId.high, parsedPrice.quotient.toString()],
      },
    ])
  }, [tokenId, parsedPrice])

  // error
  const [error, setError] = useState<string | null>(null)
  const onError = useCallback((error: string) => setError(error), [])

  // signature
  const [createOfferMutation] = useCreateOfferMutation()
  const [txHash, setTxHash] = useState<string | null>(null)

  const onSignature = useCallback(
    (signature: Signature, maxFee: string) => {
      if (!parsedPrice) return

      createOfferMutation({
        variables: { tokenId, price: parsedPrice.quotient.toString(), maxFee, signature: JSON.stringify(signature) },
      })
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
    [parsedPrice, tokenId, onSuccess]
  )

  // on close modal
  useEffect(() => {
    if (isOpen) {
      setCalls(null)
      setTxHash(null)
      setError(null)
      setPrice('')
    }
  }, [isOpen])

  return (
    <Modal onDismiss={toggleCreateOfferModal} isOpen={isOpen}>
      <StarknetSigner
        modalHeaderText={t`Enter an asking price`}
        confirmationText={t`Your offer will be created`}
        confirmationActionText={t`Confirm offer creation`}
        transactionText={t`offer creation.`}
        calls={calls ?? undefined}
        txHash={txHash ?? undefined}
        error={error ?? undefined}
        onDismiss={toggleCreateOfferModal}
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

          {currentUser?.starknetWallet.needsSignerPublicKeyUpdate ? (
            <ErrorCard>
              <LockedWallet />
            </ErrorCard>
          ) : (
            <Column gap={32}>
              <EtherInput onUserInput={onPriceInput} value={price} placeholder="0.0" />
              {parsedPrice && <SaleBreakdown price={parsedPrice.quotient.toString()} artistName={artistName} />}
            </Column>
          )}

          <PrimaryButton onClick={handleConfirmation} disabled={!isPriceValid} large>
            <Trans>Next</Trans>
          </PrimaryButton>
        </Column>
      </StarknetSigner>
    </Modal>
  )
}
