import { useState, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { Plural, t, Trans } from '@lingui/macro'
import { useQuery, gql } from '@apollo/client'
import { WeiAmount, cardId, constants, uint256 } from '@rulesorg/sdk-core'

import { ModalHeader } from '@/components/Modal'
import ClassicModal, { ModalContent } from '@/components/Modal/Classic'
import { useModalOpened, useCreateOfferModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import useCurrentUser from '@/hooks/useCurrentUser'
import Column from '@/components/Column'
import { PrimaryButton } from '@/components/Button'
import { ErrorCard } from '@/components/Card'
import LockedWallet from '@/components/LockedWallet'
import StarknetSigner, { StarknetSignerDisplayProps } from '@/components/StarknetSigner'
import EtherInput from '@/components/Input/EtherInput'
import tryParseWeiAmount from '@/utils/tryParseWeiAmount'
import { SaleBreakdown, PurchaseBreakdown } from './PriceBreakdown'
import { BIG_INT_MIN_MARKETPLACE_OFFER_PRICE, BIG_INT_MAX_MARKETPLACE_OFFER_PRICE } from '@/constants/misc'
import CardModelPriceStats from '@/components/CardModelSales/CardModelPriceStats'
import CardBreakdown from './CardBreakdown'
import { PaginationSpinner } from '@/components/Spinner'
import { useSearchCardModels } from '@/state/search/hooks'
import { TYPE } from '@/styles/theme'
import useStarknetTx from '@/hooks/useStarknetTx'
import { rulesSdk } from '@/lib/rulesWallet/rulesSdk'

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

const display: StarknetSignerDisplayProps = {
  confirmationText: t`Your offer will be created`,
  confirmationActionText: t`Confirm offer creation`,
  transactionText: t`offer creation.`,
}

interface CreateOfferModalProps {
  cardsIds: string[]
}

export default function CreateOfferModal({ cardsIds }: CreateOfferModalProps) {
  const [cardIndex, setCardIndex] = useState(0)
  const [price, setPrice] = useState('')
  const [parsedPricesTotal, setParsedPricesTotal] = useState(WeiAmount.ZERO)

  // current user
  const { currentUser } = useCurrentUser()

  // modal
  const isOpen = useModalOpened(ApplicationModal.CREATE_OFFER)
  const toggleCreateOfferModal = useCreateOfferModalToggle()

  // cards query
  const cardsQuery = useQuery(CARDS_QUERY, { variables: { ids: cardsIds }, skip: !isOpen })
  const cards = cardsQuery.data?.cardsByIds ?? []
  const card = cards[cardIndex]

  // starknet tx
  const { pushCalls, resetStarknetTx, signing, setSigning } = useStarknetTx()

  // offers creation overview
  const handleOverviewConfirmation = useCallback(() => setSigning(true), [])
  const displayOverview = useMemo(() => cards.length > 1 && cardIndex === cards.length, [(cardsIds.length, cardIndex)])

  // price
  const parsedPrice = useMemo(() => tryParseWeiAmount(price), [price])

  const onPriceInput = useCallback((value: string) => setPrice(value), [])
  const isPriceValid = useMemo(() => {
    if (!parsedPrice) return false

    return (
      !parsedPrice.lessThan(BIG_INT_MIN_MARKETPLACE_OFFER_PRICE) &&
      !parsedPrice.greaterThan(BIG_INT_MAX_MARKETPLACE_OFFER_PRICE)
    )
  }, [parsedPrice])

  // prices confirmation
  const handlePriceConfirmation = useCallback(() => {
    const marketplaceAddress = constants.MARKETPLACE_ADDRESSES[rulesSdk.networkInfos.starknetChainId]
    if (!marketplaceAddress || !parsedPrice) return

    const tokenId = cardId.getStarknetCardId(
      card.cardModel.artist.displayName,
      card.cardModel.season,
      constants.ScarcityName.indexOf(card.cardModel.scarcity.name),
      card.serialNumber
    )
    const uint256TokenId = uint256.uint256HexFromStrHex(tokenId)

    pushCalls({
      contractAddress: marketplaceAddress,
      entrypoint: 'createOffer',
      calldata: [uint256TokenId.low, uint256TokenId.high, parsedPrice.quotient.toString()],
    })

    // increase total price for final overview
    setParsedPricesTotal((state) => state.add(parsedPrice))

    // move to the next card
    setCardIndex((state) => state + 1)
  }, [parsedPrice, card])

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
      setPrice('')
      setCardIndex(0)
      setLowestAsks({})
      resetStarknetTx()
    }
  }, [isOpen])

  // loading
  const isLoading = cardsQuery.loading || cardModelSearch.loading

  return (
    <ClassicModal onDismiss={toggleCreateOfferModal} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader
          onDismiss={toggleCreateOfferModal}
          title={signing ? undefined : displayOverview ? t`Offers overview` : t`Enter an asking price`}
        />

        <StarknetSigner display={display}>
          {!!(card && lowestAsks[card.cardModel.id]) && (
            <Column gap={32}>
              <CardBreakdownWrapper>
                <CardBreakdown
                  pictureUrl={cards[cardIndex].cardModel.pictureUrl}
                  season={cards[cardIndex].cardModel.season}
                  artistName={cards[cardIndex].cardModel.artist.displayName}
                  serialNumbers={[cards[cardIndex].serialNumber]}
                  scarcityName={cards[cardIndex].cardModel.scarcity.name}
                />

                {cards.length > 1 && (
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
