import { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components/macro'
import { WeiAmount } from '@rulesorg/sdk-core'
import { gql, useLazyQuery } from '@apollo/client'
import { t } from '@lingui/macro'

import MarketplaceFilters from 'src/components/MarketplaceFilters'
import Section from 'src/components/Section'
import Column from 'src/components/Column'
import Row, { RowBetween } from 'src/components/Row'
import {
  useMarketplaceFilters,
  useSearchCardModels,
  useAlgoliaFormatedMarketplaceFilters,
  CardModelsSortingKey,
} from 'src/state/search/hooks'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import SortButton, { SortData } from 'src/components/Button/SortButton'
// import { Badge } from 'src/components/CardModel/Badges'
import { IconButton } from 'src/components/Button'
import { useEtherPrice, useMarketplaceFiltersModalToggle } from 'src/state/application/hooks'
import MarketplaceFiltersModal from 'src/components/MarketplaceFiltersModal'
import DefaultLayout from 'src/components/Layout'
import { NftCard } from 'src/components/nft/Card'

import { ReactComponent as HopperIcon } from 'src/images/hopper.svg'
import CollectionNfts from 'src/components/nft/Collection/CollectionNfts'
import { Badge } from 'src/types'

const StyledSection = styled(Section)`
  width: 100%;
  max-width: unset;
  padding: 0 32px;
  gap: 32px;
  margin: 32px 0 0;
  position: sticky;

  ${({ theme }) => theme.media.small`
    padding: 0 16px;
  `}
`

const HopperIconButton = styled(IconButton)`
  visibility: hidden;

  svg {
    margin-top: 2px; // needed to make it looks better centered
  }

  ${({ theme }) => theme.media.medium`
    visibility: visible;
  `}
`

const FiltersWrapper = styled.div`
  height: fit-content;
  position: sticky;
  top: ${({ theme }) => theme.size.headerHeight + 32}px;
  min-width: 200px;

  ${({ theme }) => theme.media.medium`
    display: none;
  `}
`

const GridWrapper = styled(Column)`
  width: 100%;
`

const GridHeader = styled(RowBetween)`
  margin-bottom: 16px;
  padding: 0 8px;
  align-items: center;
`

const CARD_MODELS_QUERY = gql`
  query ($ids: [ID!]!) {
    cardModelsByIds(ids: $ids) {
      id
      slug
      cardsOnSaleCount
      pictureUrl(derivative: "width=512")
      videoUrl
      season
      scarcity {
        name
      }
      artist {
        displayName
      }
    }
  }
`

interface MarketplaceSortData extends SortData<CardModelsSortingKey> {
  lowSerialKey: CardModelsSortingKey
}

const sortsData: MarketplaceSortData[] = [
  { name: 'Price: low to high', key: 'lowestAskAsc', lowSerialKey: 'lowSerialLowestAskAsc', desc: true },
  { name: 'Price: high to low', key: 'lowestAskDesc', lowSerialKey: 'lowSerialLowestAskDesc', desc: false },
]

function Marketplace() {
  const [cardModelsHits, setCardModelsHits] = useState<any[]>([])
  const [highestLowestAsk, setHighestLowestAsk] = useState(0)
  const [sortIndex, setSortIndex] = useState(0)
  const [cardModelsTable, setCardModelsTable] = useState<{ [key: string]: any }>({})

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()
  const etherPrice = useEtherPrice()

  // filters
  const marketplaceFilters = useMarketplaceFilters()
  const algoliaFormatedMarketplaceFilters = useAlgoliaFormatedMarketplaceFilters()

  // filters modal
  const toggleMarketplaceFiltersModal = useMarketplaceFiltersModalToggle()

  // sort
  const sortingKey = useMemo(
    () => sortsData[sortIndex][marketplaceFilters.lowSerials ? 'lowSerialKey' : 'key'],
    [sortIndex, marketplaceFilters.lowSerials]
  )
  const highestLowestAskSortingKey = useMemo(
    () => (marketplaceFilters.lowSerials ? 'lowSerialLowestAskDesc' : 'lowestAskDesc'),
    [marketplaceFilters.lowSerials]
  )

  // query card models data
  const onCardModelsQueryCompleted = useCallback((data: any) => {
    setCardModelsTable((state) => ({
      ...state,
      ...(data.cardModelsByIds as any[]).reduce<{ [key: string]: any }>((acc, cardModel) => {
        acc[cardModel.id] = cardModel
        return acc
      }, {}),
    }))
  }, [])
  const [queryCardModelsData] = useLazyQuery(CARD_MODELS_QUERY, {
    onCompleted: onCardModelsQueryCompleted,
    fetchPolicy: 'cache-and-network',
  })

  // search cards models
  const onCardModelsPageFetched = useCallback(
    (hits, { pageNumber }) => {
      if (!pageNumber) setCardModelsHits([])

      queryCardModelsData({ variables: { ids: hits.map((hit: any) => hit.objectID) } })

      setCardModelsHits((state) => state.concat(hits))
    },
    [queryCardModelsData]
  )
  const cardModelsSearch = useSearchCardModels({
    ...algoliaFormatedMarketplaceFilters,
    sortingKey,
    onPageFetched: onCardModelsPageFetched,
  })

  // highest lowest ask
  const onHighestLowestAskPageFetched = useCallback(
    (hits) => {
      if (!hits[0]) {
        setHighestLowestAsk(0)
      } else {
        const fiatValue = weiAmountToEURValue(
          WeiAmount.fromRawAmount(marketplaceFilters.lowSerials ? hits[0].lowSerialLowestAsk : hits[0].lowestAsk)
        )
        setHighestLowestAsk(Math.ceil(+(fiatValue ?? 0)))
      }
    },
    [weiAmountToEURValue, marketplaceFilters.lowSerials]
  )
  useSearchCardModels({
    facets: algoliaFormatedMarketplaceFilters.facets, // only use facets
    sortingKey: highestLowestAskSortingKey,
    hitsPerPage: 1,
    onPageFetched: onHighestLowestAskPageFetched,
    skip: !etherPrice,
  })

  const cardModels = useMemo(
    () =>
      cardModelsHits
        .filter((hit) => cardModelsTable[hit.objectID])
        .map((hit: any) => {
          const cardModel = cardModelsTable[hit.objectID]
          const lowestAsk = marketplaceFilters.lowSerials ? hit.lowSerialLowestAsk : hit.lowestAsk
          const parsedLowestAsk = lowestAsk ? WeiAmount.fromRawAmount(lowestAsk) : undefined

          return (
            <NftCard
              key={cardModel.slug}
              asset={{
                animationUrl: cardModel.videoUrl,
                imageUrl: cardModel.pictureUrl,
                tokenId: cardModel.slug,
                scarcity: cardModel.scarcity.name,
              }}
              display={{
                primaryInfo: cardModel.artist.displayName,
                secondaryInfo: t`${cardModel.cardsOnSaleCount} offers`,
                subtitle: parsedLowestAsk
                  ? t`from ${parsedLowestAsk.toSignificant(6)} ETH (€${weiAmountToEURValue(parsedLowestAsk)})`
                  : undefined,
              }}
              badges={marketplaceFilters.lowSerials ? [Badge.LOW_SERIAL] : undefined}
            />
          )
        }),
    [cardModelsHits, cardModelsTable]
  )

  return (
    <>
      <StyledSection>
        <GridHeader>
          <HopperIconButton onClick={toggleMarketplaceFiltersModal} square>
            <HopperIcon />
          </HopperIconButton>

          <SortButton sortsData={sortsData} onChange={setSortIndex} sortIndex={sortIndex} />
        </GridHeader>

        <Row gap={32}>
          <FiltersWrapper>
            <MarketplaceFilters maximumPriceUpperBound={highestLowestAsk} />
          </FiltersWrapper>

          <GridWrapper>
            <CollectionNfts
              next={cardModelsSearch.nextPage}
              hasNext={cardModelsSearch.hasNext}
              dataLength={cardModels.length ?? 0}
            >
              {cardModels}
            </CollectionNfts>
          </GridWrapper>
        </Row>
      </StyledSection>

      <MarketplaceFiltersModal maximumPriceUpperBound={highestLowestAsk} />
    </>
  )
}

Marketplace.withLayout = () => (
  <DefaultLayout>
    <Marketplace />
  </DefaultLayout>
)

export default Marketplace
