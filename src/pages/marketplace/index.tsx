import { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
import { WeiAmount } from '@rulesorg/sdk-core'

import MarketplaceSidebar from '@/components/MarketplaceSidebar'
import Section from '@/components/Section'
import GridHeader from '@/components/GridHeader'
import CardModel from '@/components/CardModel'
import { TYPE } from '@/styles/theme'
import { ColumnCenter } from '@/components/Column'
import Grid from '@/components/Grid'
import { useMarketplaceFilters, useMarketplaceSetMaximumPrice } from '@/state/search/hooks'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'

const MainSection = styled(Section)`
  margin-top: 44px;

  ${({ theme }) => theme.media.medium`
    margin-top: 32px;
  `}
`

const MarketplaceBody = styled.div`
  margin: 0 64px 32px 347px;

  ${({ theme }) => theme.media.medium`
    margin: 0 32px 32px;
  `}

  ${({ theme }) => theme.media.extraSmall`
    margin: 0 16px 32px;
  `}
`

const StyledGrid = styled(Grid)`
  ${({ theme }) => theme.media.extraSmall`
    grid-template-columns: repeat(2, 1fr);
    gap: 28px;
  `}
`

const StyledMarketplaceSidebar = styled(MarketplaceSidebar)<{ isOpenOnMobile?: boolean }>`
  ${({ theme, isOpenOnMobile }) => theme.media.medium`
    ${!isOpenOnMobile && 'display: none;'}
  `}
`

const FiltersButton = styled(TYPE.body)`
  visibility: hidden;
  font-weight: 700;
  cursor: pointer;

  ${({ theme }) => theme.media.medium`
    visibility: visible;
  `}
`

const CARD_MODELS_ON_SALE_QUERY = gql`
  query {
    cardModelsOnSale {
      slug
      lowestAsk
      pictureUrl(derivative: "width=720")
      season
      scarcity {
        name
      }
    }
  }
`

export default function Marketplace() {
  // filters
  const filters = useMarketplaceFilters()

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // sort
  const [increaseSort, setIncreaseSort] = useState(true)

  const toggleSort = useCallback(() => {
    setIncreaseSort(!increaseSort)
  }, [increaseSort, setIncreaseSort])

  // filters
  const setMaximumPrice = useMarketplaceSetMaximumPrice()

  // filters sidebar
  const [isFiltersSidebarOpenOnMobile, setIsFiltersSidebarOpenOnMobile] = useState(false)
  const toggleFiltersOnMobile = useCallback(() => {
    setIsFiltersSidebarOpenOnMobile(!isFiltersSidebarOpenOnMobile)
  }, [isFiltersSidebarOpenOnMobile, setIsFiltersSidebarOpenOnMobile])

  // query
  const cardModelsQuery = useQuery(CARD_MODELS_ON_SALE_QUERY)

  const { cardModels, highestLowestAsk, lowestLowestAsk } = useMemo(() => {
    let highestLowestAsk: WeiAmount | undefined
    let lowestLowestAsk: WeiAmount | undefined

    const cardModels = (cardModelsQuery?.data?.cardModelsOnSale ?? []).filter((cardModel: any) => {
      const parsedLowestAsk = WeiAmount.fromRawAmount(cardModel.lowestAsk)

      if (filters.seasons.length && !filters.seasons.includes(cardModel.season)) return false
      if (filters.scarcities.length && !filters.scarcities.includes(cardModel.scarcity.name)) return false

      // get highest lowest ask before filtering by price
      highestLowestAsk =
        !highestLowestAsk || parsedLowestAsk.greaterThan(highestLowestAsk) ? parsedLowestAsk : highestLowestAsk
      lowestLowestAsk =
        !lowestLowestAsk || parsedLowestAsk.lessThan(lowestLowestAsk) ? parsedLowestAsk : lowestLowestAsk

      if (filters.maximumPrice !== null && filters.maximumPrice < weiAmountToEURValue(parsedLowestAsk)) return false
      return true
    })

    const [highestLowestAskFiat, lowestLowestAskFiat] = [
      Math.ceil(weiAmountToEURValue(highestLowestAsk)),
      Math.ceil(weiAmountToEURValue(lowestLowestAsk)),
    ]

    if (!filters.maximumPrice || filters.maximumPrice > highestLowestAskFiat) setMaximumPrice(highestLowestAskFiat)
    else if (filters.maximumPrice < lowestLowestAskFiat) setMaximumPrice(lowestLowestAskFiat)

    return { cardModels, highestLowestAsk, lowestLowestAsk }
  }, [filters, cardModelsQuery?.data?.cardModelsOnSale, weiAmountToEURValue, setMaximumPrice])

  if (cardModelsQuery.error || cardModelsQuery.loading) {
    if (cardModelsQuery.error) console.error(cardModelsQuery.error)
    return null
  }

  return (
    <>
      <StyledMarketplaceSidebar
        maximumPriceLowerBound={Math.ceil(weiAmountToEURValue(lowestLowestAsk))}
        maximumPriceUpperBound={Math.ceil(weiAmountToEURValue(highestLowestAsk))}
        isOpenOnMobile={isFiltersSidebarOpenOnMobile}
        dispatch={toggleFiltersOnMobile}
      />
      <MainSection size="max">
        <MarketplaceBody>
          <GridHeader
            sortTexts={['Price: low to high', 'Price: high to low']}
            sortValue={increaseSort}
            onSortUpdate={toggleSort}
          >
            <FiltersButton onClick={toggleFiltersOnMobile}>Filters</FiltersButton>
          </GridHeader>
          <StyledGrid>
            {cardModels.map((cardModel: any, index: number) => (
              <ColumnCenter gap={12} key={`mktp-card-${index}`}>
                <CardModel
                  pictureUrl={cardModel.pictureUrl}
                  cardModelSlug={cardModel.slug}
                  lowestAsk={cardModel.lowestAsk}
                />
              </ColumnCenter>
            ))}
          </StyledGrid>
        </MarketplaceBody>
      </MainSection>
    </>
  )
}
