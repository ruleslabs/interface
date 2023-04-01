import { useState, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { Plural, t, Trans } from '@lingui/macro'
import { uint256HexFromStrHex, getStarknetCardId, ScarcityName, WeiAmount } from '@rulesorg/sdk-core'
import { ApolloError, useQuery, gql } from '@apollo/client'
import { Call, Signature, stark } from 'starknet'

import { ModalHeader } from '@/components/Modal'
import ClassicModal, { ModalContent } from '@/components/Modal/Classic'
import { useModalOpened, useCreateOfferModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { useCurrentUser } from '@/state/user/hooks'
import Column from '@/components/Column'
import { PrimaryButton } from '@/components/Button'
import { ErrorCard } from '@/components/Card'
import LockedWallet from '@/components/LockedWallet'
import StarknetSigner from '@/components/StarknetSigner'
import { MARKETPLACE_ADDRESSES, RULES_TOKENS_ADDRESSES } from '@/constants/addresses'
import { useCreateOffersMutation } from '@/state/wallet/hooks'
import { networkId } from '@/constants/networks'
import EtherInput from '@/components/Input/EtherInput'
import tryParseWeiAmount from '@/utils/tryParseWeiAmount'
import { SaleBreakdown, PurchaseBreakdown } from './PriceBreakdown'
import { BIG_INT_MIN_MARKETPLACE_OFFER_PRICE, BIG_INT_MAX_MARKETPLACE_OFFER_PRICE } from '@/constants/misc'
import CardModelPriceStats from '@/components/CardModelSales/CardModelPriceStats'
import CardBreakdown from './CardBreakdown'
import { PaginationSpinner } from '@/components/Spinner'
import { useSearchCardModels } from '@/state/search/hooks'
import { TYPE } from '@/styles/theme'

const CardBreakdownWrapper = styled.div`
  position: relative;
`

const StyledCardModelPriceStats = styled(CardModelPriceStats)`
  gap: 32px;
`

const CardsCount = styled(TYPE.body)`
  font-weight: 500;
  position: absolute;
  bottom: 8px;
  right: 16px;
`

const CARDS_QUERY = gql`
  query ($ids: [ID!]!) {
    cardsByIds(ids: $ids) {
      serialNumber
      cardModel {
        id
        pictureUrl(derivative: "width=256px")
        averageSale
        season
        scarcity {
          name
          maxSupply
        }
        artist {
          displayName
        }
      }
    }
  }
`

interface CreateOfferModalProps {
  // lowestAsk?: string
  cardsIds: string[]
  onSuccess(): void
}

export default function CreateOfferModal({ cardsIds, onSuccess }: CreateOfferModalProps) {
  // current user
  const currentUser = useCurrentUser()

  // modal
  const isOpen = useModalOpened(ApplicationModal.CREATE_OFFER)
  const toggleCreateOfferModal = useCreateOfferModalToggle()

  // cards query
  const cardsQuery = useQuery(CARDS_QUERY, { variables: { ids: cardsIds }, skip: !isOpen })
  const cards = cardsQuery.data?.cardsByIds ?? []

  // card index
  const [cardIndex, setCardIndex] = useState(0)

  // token ids
  const tokenIds: string[] = useMemo(
    () =>
      cards.map((card: any) =>
        getStarknetCardId(
          card.cardModel.artist.displayName,
          card.cardModel.season,
          ScarcityName.indexOf(card.cardModel.scarcity.name),
          card.serialNumber
        )
      ),
    [cards.length]
  )

  // offers creation overview
  const [needsOverview, setNeedsOverview] = useState(false)
  const handleOverviewConfirmation = useCallback(() => setNeedsOverview(false), [])
  const displayOverview = useMemo(
    () => !cardsIds[cardIndex] && needsOverview,
    [cardsIds.length, cardIndex, needsOverview]
  )

  // overview init
  useEffect(() => {
    setNeedsOverview(cardsIds.length > 1) // overview not needed for a single offer creation
  }, [cardsIds.length])

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

  // prices
  const [parsedPrices, setParsedPrices] = useState<WeiAmount[]>([])
  const [parsedPricesTotal, setParsedPricesTotal] = useState<WeiAmount>(WeiAmount.fromRawAmount(0))

  // prices confirmation
  const handlePriceConfirmation = useCallback(() => {
    if (!parsedPrice) return

    setCardIndex((state) => state + 1)
    setParsedPrices((state) => state.concat(parsedPrice))
    setParsedPricesTotal((state) => state.add(parsedPrice))
    setPrice('')
  }, [parsedPrice])

  // calls
  const [calls, setCalls] = useState<Call[] | null>(null)
  useEffect(() => {
    if (!tokenIds.length || tokenIds.length > parsedPrices.length || needsOverview) return

    // all prices are set, calls can be created
    setCalls(
      tokenIds.flatMap((tokenId, index) => {
        const uint256TokenId = uint256HexFromStrHex(tokenId)

        return [
          {
            contractAddress: RULES_TOKENS_ADDRESSES[networkId],
            entrypoint: 'approve',
            calldata: [MARKETPLACE_ADDRESSES[networkId], uint256TokenId.low, uint256TokenId.high, 1, 0],
          },
          {
            contractAddress: MARKETPLACE_ADDRESSES[networkId],
            entrypoint: 'createOffer',
            calldata: [uint256TokenId.low, uint256TokenId.high, parsedPrices[index].quotient.toString()],
          },
        ]
      })
    )
  }, [tokenIds.length, parsedPrices.length, needsOverview])

  // error
  const [error, setError] = useState<string | null>(null)
  const onError = useCallback((error: string) => setError(error), [])

  // signature
  const [createOffersMutation] = useCreateOffersMutation()
  const [txHash, setTxHash] = useState<string | null>(null)

  const onSignature = useCallback(
    (signature: Signature, maxFee: string, nonce: string) => {
      createOffersMutation({
        variables: {
          tokenIds,
          prices: parsedPrices.map((parsedPrice) => parsedPrice.quotient.toString()),
          maxFee,
          nonce,
          signature: stark.signatureToDecimalArray(signature),
        },
      })
        .then((res?: any) => {
          const hash = res?.data?.createOffers?.hash
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
    [parsedPrices.length, tokenIds.length, onSuccess]
  )

  // Lowest ask
  const [lowestAsks, setLowestAsks] = useState<{ [id: string]: string }>({})

  // card model search
  const cardModelsIds = useMemo(() => cards.map((card: any) => card.cardModel.id), [cards.length])

  const onPageFetched = useCallback((hits: any[]) => {
    setLowestAsks(
      hits.reduce<typeof lowestAsks>((acc, hit) => {
        acc[hit.objectID] = hit.lowestAsk
        return acc
      }, {})
    )
  }, [])
  const cardModelSearch = useSearchCardModels({
    facets: { cardModelId: cardModelsIds },
    skip: !cardModelsIds.length,
    hitsPerPage: cardModelsIds.length,
    onPageFetched,
  })

  // on close modal
  useEffect(() => {
    if (isOpen) {
      setCalls(null)
      setTxHash(null)
      setError(null)
      setPrice('')
      setCardIndex(0)
      setParsedPrices([])
      setParsedPricesTotal(WeiAmount.fromRawAmount(0))
      setLowestAsks({})
    }
  }, [isOpen])

  // loading
  const isLoading = cardsQuery.loading || cardModelSearch.loading

  return (
    <ClassicModal onDismiss={toggleCreateOfferModal} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader
          onDismiss={toggleCreateOfferModal}
          title={calls ? undefined : displayOverview ? t`Offers overview` : t`Enter an asking price`}
        />

        <StarknetSigner
          confirmationText={t`Your offer will be created`}
          confirmationActionText={t`Confirm offer creation`}
          transactionText={t`offer creation.`}
          calls={calls ?? undefined}
          txHash={txHash ?? undefined}
          error={error ?? undefined}
          onSignature={onSignature}
          onError={onError}
        >
          {!!cards[cardIndex] && !!lowestAsks[cards[cardIndex].cardModel.id] && (
            <Column gap={32}>
              <CardBreakdownWrapper>
                <CardBreakdown
                  pictureUrl={cards[cardIndex].cardModel.pictureUrl}
                  season={cards[cardIndex].cardModel.season}
                  artistName={cards[cardIndex].cardModel.artist.displayName}
                  serialNumbers={[cards[cardIndex].serialNumber]}
                  scarcityName={cards[cardIndex].cardModel.scarcity.name}
                />

                {needsOverview && (
                  <CardsCount>
                    {cardIndex + 1} / {cards.length}
                  </CardsCount>
                )}
              </CardBreakdownWrapper>

              <StyledCardModelPriceStats
                lowestAsk={lowestAsks[cards[cardIndex].cardModel.id]}
                averageSale={cards[cardIndex].cardModel.averageSale}
              />

              {currentUser?.starknetWallet.lockingReason ? (
                <ErrorCard>
                  <LockedWallet />
                </ErrorCard>
              ) : (
                <Column gap={32}>
                  <EtherInput onUserInput={onPriceInput} value={price} placeholder="0.0" />
                  {parsedPrice && (
                    <SaleBreakdown
                      price={parsedPrice.quotient.toString()}
                      artistName={cards[cardIndex].cardModel.artist.displayName}
                    />
                  )}
                </Column>
              )}

              <PrimaryButton onClick={handlePriceConfirmation} disabled={!isPriceValid} large>
                <Trans>Next</Trans>
              </PrimaryButton>
            </Column>
          )}

          {displayOverview && (
            <Column gap={32}>
              <PurchaseBreakdown price={parsedPricesTotal.quotient.toString()}>
                <Plural value={cards.length} _1="Total ({0} card)" other="Total ({0} cards)" />
              </PurchaseBreakdown>
              <SaleBreakdown price={parsedPricesTotal.quotient.toString()} />

              <PrimaryButton onClick={handleOverviewConfirmation} large>
                <Trans>Next</Trans>
              </PrimaryButton>
            </Column>
          )}

          <PaginationSpinner loading={isLoading} />
        </StarknetSigner>
      </ModalContent>
    </ClassicModal>
  )
}
