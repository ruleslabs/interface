import { useState, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { t, Trans } from '@lingui/macro'
import { uint256HexFromStrHex, getStarknetCardId, Fraction, ScarcityName } from '@rulesorg/sdk-core'
import { ApolloError } from '@apollo/client'
import { Call, Signature } from 'starknet'

import Modal from '@/components/Modal'
import { useModalOpen, useCreateOfferModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { useCurrentUser } from '@/state/user/hooks'
import Column from '@/components/Column'
import Row, { RowCenter } from '@/components/Row'
import { TYPE } from '@/styles/theme'
import { PrimaryButton } from '@/components/Button'
import { ErrorCard } from '@/components/Card'
import LockedWallet from '@/components/LockedWallet'
import StarknetSigner from '@/components/StarknetSigner'
import { MARKETPLACE_ADDRESSES, RULES_TOKENS_ADDRESSES } from '@/constants/addresses'
import { useCreateOfferMutation } from '@/state/wallet/hooks'
import { networkId } from '@/constants/networks'
import EtherInput from '@/components/Input/EtherInput'
import {
  ARTIST_FEE_PERCENTAGE,
  MARKETPLACE_FEE_PERCENTAGE,
  BIG_INT_MIN_MARKETPLACE_OFFER_PRICE,
  BIG_INT_MAX_MARKETPLACE_OFFER_PRICE,
} from '@/constants/misc'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import Tooltip from '@/components/Tooltip'
import tryParseWeiAmount from '@/utils/tryParseWeiAmount'

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

const SaleBreakdownLine = styled(Row)`
  width: 100%;
  gap: 8px;

  & > div:last-child {
    margin-left: auto;
  }
`

const Separator = styled.div`
  background: ${({ theme }) => theme.bg3};
  margin: 8px 0;
  width: 100%;
  height: 3px;
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

  // price breakdown
  const { artistFee, marketplaceFee, payout } = useMemo(() => {
    return {
      artistFee: parsedPrice?.multiply(new Fraction(ARTIST_FEE_PERCENTAGE, 1_000_000)),
      marketplaceFee: parsedPrice?.multiply(new Fraction(MARKETPLACE_FEE_PERCENTAGE, 1_000_000)),
      payout: parsedPrice?.multiply(
        new Fraction(1_000_000 - MARKETPLACE_FEE_PERCENTAGE - ARTIST_FEE_PERCENTAGE, 1_000_000)
      ),
    }
  }, [parsedPrice])

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

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
              <Column gap={12}>
                <SaleBreakdownLine>
                  <TYPE.body>
                    <Trans>Artist fee ({ARTIST_FEE_PERCENTAGE / 10_000}%)</Trans>
                  </TYPE.body>

                  <Tooltip text={t`This fee will go to ${artistName} and his team.`} />

                  <Row gap={8}>
                    <TYPE.subtitle>{weiAmountToEURValue(artistFee) ?? 0} EUR</TYPE.subtitle>
                    <TYPE.body>{artistFee?.toSignificant(6) ?? 0} ETH</TYPE.body>
                  </Row>
                </SaleBreakdownLine>

                <SaleBreakdownLine>
                  <TYPE.body>
                    <Trans>Marketplace fee ({MARKETPLACE_FEE_PERCENTAGE / 10_000}%)</Trans>
                  </TYPE.body>

                  <Tooltip text={t`This fee will help Rules' further development.`} />

                  <Row gap={8}>
                    <TYPE.subtitle>{weiAmountToEURValue(marketplaceFee) ?? 0} EUR</TYPE.subtitle>
                    <TYPE.body>{marketplaceFee?.toSignificant(6) ?? 0} ETH</TYPE.body>
                  </Row>
                </SaleBreakdownLine>

                <Separator />

                <SaleBreakdownLine>
                  <TYPE.body>
                    <Trans>Total payout</Trans>
                  </TYPE.body>

                  <Row gap={8}>
                    <TYPE.subtitle>{weiAmountToEURValue(payout) ?? 0} EUR</TYPE.subtitle>
                    <TYPE.body>{payout?.toSignificant(6) ?? 0} ETH</TYPE.body>
                  </Row>
                </SaleBreakdownLine>
              </Column>
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
