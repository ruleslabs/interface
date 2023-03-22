import { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { WeiAmount } from '@rulesorg/sdk-core'
import { gql, useLazyQuery } from '@apollo/client'

import MarketplaceFilters from '@/components/MarketplaceFilters'
import Section from '@/components/Section'
import CardModel from '@/components/CardModel'
import Column, { ColumnCenter } from '@/components/Column'
import Row, { RowBetween } from '@/components/Row'
import Grid from '@/components/Grid'
import {
  useMarketplaceFilters,
  useSearchCardModels,
  useAlgoliaFormatedMarketplaceFilters,
  CardModelsSortingKey,
} from '@/state/search/hooks'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import { PaginationSpinner } from '@/components/Spinner'
import SortButton, { SortData } from '@/components/Button/SortButton'
import useInfiniteScroll from '@/hooks/useInfiniteScroll'
import { Badge } from '@/components/CardModel/Badges'
import { IconButton } from '@/components/Button'
import { useToggleMarketplaceFiltersModal } from '@/state/application/hooks'

import HopperIcon from '@/images/hopper.svg'
import MarketplaceFiltersModal from '@/components/MarketplaceFiltersModal'

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
      pictureUrl(derivative: "width=720")
      videoUrl
      season
      scarcity {
        name
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

export default function Marketplace() {
  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // filters
  const marketplaceFilters = useMarketplaceFilters()
  const algoliaFormatedMarketplaceFilters = useAlgoliaFormatedMarketplaceFilters()

  // filters modal
  const toggleMarketplaceFiltersModal = useToggleMarketplaceFiltersModal()

  // sort
  const [sortIndex, setSortIndex] = useState(0)
  const sortingKey = useMemo(
    () => sortsData[sortIndex][marketplaceFilters.lowSerials ? 'lowSerialKey' : 'key'],
    [sortIndex, marketplaceFilters.lowSerials]
  )
  const highestLowestAskSortingKey = useMemo(
    () => (marketplaceFilters.lowSerials ? 'lowSerialLowestAskDesc' : 'lowestAskDesc'),
    [marketplaceFilters.lowSerials]
  )

  // hits
  const [cardModelsHits, setCardModelsHits] = useState<any[]>([])
  const [pendingHits, setPendingHits] = useState<any[]>([])

  // tables
  const [cardModelsTable, setCardModelsTable] = useState<{ [key: string]: any }>({})

  // query card models data
  const onCardModelsQueryCompleted = useCallback(
    (data: any) => {
      setCardModelsTable({
        ...cardModelsTable,
        ...(data.cardModelsByIds as any[]).reduce<{ [key: string]: any }>((acc, cardModel) => {
          acc[cardModel.id] = cardModel
          return acc
        }, {}),
      })

      setCardModelsHits(cardModelsHits.concat(pendingHits))
    },
    [Object.keys(cardModelsTable).length, cardModelsHits.length, pendingHits]
  )
  const [queryCardModelsData, cardModelsQuery] = useLazyQuery(CARD_MODELS_QUERY, {
    onCompleted: onCardModelsQueryCompleted,
    fetchPolicy: 'cache-and-network',
  })

  // search cards models
  const onCardModelsPageFetched = useCallback(
    (hits, { pageNumber }) => {
      if (!pageNumber) setCardModelsHits([])

      queryCardModelsData({ variables: { ids: hits.map((hit: any) => hit.objectID) } })

      setPendingHits(hits)
    },
    [queryCardModelsData]
  )
  const cardModelsSearch = useSearchCardModels({
    ...algoliaFormatedMarketplaceFilters,
    sortingKey,
    onPageFetched: onCardModelsPageFetched,
  })

  // highest lowest ask
  const [highestLowestAsk, setHighestLowestAsk] = useState(0)

  const onHighestLowestAskPageFetched = useCallback(
    (hits) => {
      const fiatValue = weiAmountToEURValue(
        WeiAmount.fromRawAmount(marketplaceFilters.lowSerials ? hits[0].lowSerialLowestAsk : hits[0].lowestAsk)
      )
      setHighestLowestAsk(Math.ceil(+(fiatValue ?? 0)))
    },
    [weiAmountToEURValue, marketplaceFilters.lowSerials]
  )
  const highestLowestAskSearch = useSearchCardModels({
    facets: algoliaFormatedMarketplaceFilters.facets, // only use facets
    sortingKey: highestLowestAskSortingKey,
    hitsPerPage: 1,
    onPageFetched: onHighestLowestAskPageFetched,
  })

  // loading
  const isLoading = cardModelsSearch.loading || cardModelsQuery.loading || highestLowestAskSearch.loading

  // infinite scroll
  const lastCardModelRef = useInfiniteScroll({ nextPage: cardModelsSearch.nextPage, loading: isLoading })

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
            <Grid>
              {cardModelsHits
                .filter((hit) => cardModelsTable[hit.objectID])
                .map((hit: any, index: number) => (
                  <ColumnCenter
                    gap={12}
                    key={index}
                    ref={index + 1 === cardModelsHits.length ? lastCardModelRef : undefined}
                  >
                    <CardModel
                      videoUrl={cardModelsTable[hit.objectID].videoUrl}
                      pictureUrl={cardModelsTable[hit.objectID].pictureUrl}
                      cardModelSlug={cardModelsTable[hit.objectID].slug}
                      lowestAsk={marketplaceFilters.lowSerials ? hit.lowSerialLowestAsk : hit.lowestAsk}
                      badges={marketplaceFilters.lowSerials ? [Badge.LOW_SERIAL] : undefined}
                    />
                  </ColumnCenter>
                ))}
            </Grid>

            <PaginationSpinner loading={isLoading} />
          </GridWrapper>
        </Row>
      </StyledSection>

      <MarketplaceFiltersModal maximumPriceUpperBound={highestLowestAsk} />
    </>
  )
}
