import { useState, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { t, Trans } from '@lingui/macro'
import { WeiAmount, Fraction, uint256HexFromStrHex } from '@rulesorg/sdk-core'
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
import { MARKETPLACE_ADDRESSES } from '@/constants/addresses'
import { useCreateOfferMutation } from '@/state/wallet/hooks'
import { networkId } from '@/constants/networks'
import EtherInput from '@/components/Input/EtherInput'
import Row from '@/components/Row'
import {
  ARTIST_FEE_PERCENTAGE,
  MARKETPLACE_FEE_PERCENTAGE,
  BIG_INT_MIN_MARKETPLACE_OFFER_PRICE,
  BIG_INT_MAX_MARKETPLACE_OFFER_PRICE,
} from '@/constants/misc'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import Tooltip from '@/components/Tooltip'

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
}: CreateOfferModalProps) {
  // current user
  const currentUser = useCurrentUser()

  // modal
  const isOpen = useModalOpen(ApplicationModal.CREATE_OFFER)
  const toggleCreateOfferModal = useCreateOfferModalToggle()

  // price
  const [price, setPrice] = useState<string>('')
  const onPriceInput = useCallback((value: string) => setPrice(value), [])
  const isPriceValid = useMemo(() => {
    const weiAmountPrice = WeiAmount.fromEtherAmount(price.length ? price : 0)

    return (
      !weiAmountPrice.lessThan(BIG_INT_MIN_MARKETPLACE_OFFER_PRICE) &&
      !weiAmountPrice.greaterThan(BIG_INT_MAX_MARKETPLACE_OFFER_PRICE)
    )
  }, [price])

  // price breakdown
  const { artistFee, marketplaceFee, payout } = useMemo(() => {
    const total = WeiAmount.fromEtherAmount(price.length ? price : 0)

    return {
      artistFee: total.multiply(new Fraction(ARTIST_FEE_PERCENTAGE, 1_000_000)),
      marketplaceFee: total.multiply(new Fraction(MARKETPLACE_FEE_PERCENTAGE, 1_000_000)),
      payout: total.multiply(new Fraction(1_000_000 - MARKETPLACE_FEE_PERCENTAGE - ARTIST_FEE_PERCENTAGE, 1_000_000)),
    }
  }, [price])

  // fiat
  const weiAmounToEurValue = useWeiAmountToEURValue()

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
        modalHeaderText={t`Enter an asking price`}
        confirmationText={t`Your offer will be created`}
        transactionText={t`offer creation.`}
        call={call ?? undefined}
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
                    <TYPE.subtitle>{weiAmounToEurValue(artistFee)} EUR</TYPE.subtitle>
                    <TYPE.body>{artistFee.toSignificant(6)} ETH</TYPE.body>
                  </Row>
                </SaleBreakdownLine>

                <SaleBreakdownLine>
                  <TYPE.body>
                    <Trans>Marketplace fee ({MARKETPLACE_FEE_PERCENTAGE / 10_000}%)</Trans>
                  </TYPE.body>

                  <Tooltip text={t`This fee will help Rules' further development.`} />

                  <Row gap={8}>
                    <TYPE.subtitle>{weiAmounToEurValue(marketplaceFee)} EUR</TYPE.subtitle>
                    <TYPE.body>{marketplaceFee.toSignificant(6)} ETH</TYPE.body>
                  </Row>
                </SaleBreakdownLine>

                <Separator />

                <SaleBreakdownLine>
                  <TYPE.body>
                    <Trans>Total payout</Trans>
                  </TYPE.body>

                  <Row gap={8}>
                    <TYPE.subtitle>{weiAmounToEurValue(payout)} EUR</TYPE.subtitle>
                    <TYPE.body>{payout.toSignificant(6)} ETH</TYPE.body>
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
