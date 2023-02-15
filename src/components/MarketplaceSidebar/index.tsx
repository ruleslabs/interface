import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Seasons, ScarcityName } from '@rulesorg/sdk-core'
import { Trans } from '@lingui/macro'

import Column from '@/components/Column'
import Checkbox from '@/components/Checkbox'
import Slider from '@/components/Slider'
import { TYPE } from '@/styles/theme'
import { useMarketplaceFilters, useMarketplaceFiltersHandlers } from '@/state/search/hooks'

import Close from '@/images/close.svg'

const StyledClose = styled(Close)`
  width: 20px;
  height: 20px;
  display: none;
  right: 18px;
  top: 24px;
  position: absolute;
  cursor: pointer;

  ${({ theme }) => theme.media.medium`
    display: initial;
  `}
`

const StyledMarketplaceSidebar = styled.div`
  background: ${({ theme }) => theme.bg2};
  position: fixed;
  width: 283px;
  top: ${({ theme }) => theme.size.headerHeight}px;
  bottom: 0;
  left: 0;
  z-index: 1;

  ${({ theme }) => theme.media.mediumGT`
    & ~ footer {
      left: 283px;
    }
  `}

  ${({ theme }) => theme.media.medium`
    top: ${theme.size.headerHeightMedium}px;
  `}
`

const SidebarContent = styled.div`
  position: absolute;
  top: 40px;
  bottom: 40px;
  left: 40px;
  right: 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;

  ${({ theme }) => theme.media.medium`
    top: 64px;
  `}
`

const SidebarTitle = styled(TYPE.body)`
  font-weight: 700;
  margin: 0;
  width 100%;
  text-align: center;
`

const FilterName = styled(TYPE.body)`
  font-weight: 700;
  margin: 0;
`

interface MarketplaceSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  dispatch: () => void
  maximumPriceUpperBound: number
}

export default function MarketplaceSidebar({ dispatch, maximumPriceUpperBound, ...props }: MarketplaceSidebarProps) {
  const filters = useMarketplaceFilters()

  const {
    toggleScarcityFilter,
    toggleSeasonFilter,
    toggleLowSerialsFilter,
    setMaximumPrice: setMarketplaceMaximumPrice,
  } = useMarketplaceFiltersHandlers()

  // max price
  const [maximumPrice, setMaximumPrice] = useState(maximumPriceUpperBound)

  // max price debounce
  const debounceMaximumPrice = useCallback(() => setMarketplaceMaximumPrice(maximumPrice), [maximumPrice])
  const handleDebouncedMaximumPriceUpdate = useCallback((value: number) => {
    setMaximumPrice(value)
    setMarketplaceMaximumPrice(value)
  }, [])

  useEffect(() => {
    if (!filters.maximumPrice || filters.maximumPrice > maximumPriceUpperBound) {
      setMarketplaceMaximumPrice(maximumPriceUpperBound)
      setMaximumPrice(maximumPriceUpperBound)
    }
  }, [setMarketplaceMaximumPrice, maximumPriceUpperBound, filters.maximumPrice])

  return (
    <StyledMarketplaceSidebar {...props}>
      <StyledClose onClick={dispatch} />
      <SidebarContent>
        <SidebarTitle>
          <Trans>Filters</Trans>
        </SidebarTitle>

        <Column gap={12}>
          <FilterName>
            <Trans>Seasons</Trans>
          </FilterName>
          {Object.keys(Seasons).map((season: string) => (
            <Checkbox
              key={`checkbox-season-${season}`}
              value={!filters.seasons.includes(+season)}
              onChange={() => toggleSeasonFilter(+season)}
            >
              <TYPE.body>
                <Trans>Season {season}</Trans>
              </TYPE.body>
            </Checkbox>
          ))}
        </Column>

        <Column gap={12}>
          <FilterName>
            <Trans>Scarcities</Trans>
          </FilterName>
          {ScarcityName.map((scarcity: string, index) => (
            <Checkbox
              key={`checkbox-tier-${scarcity}`}
              value={!filters.scarcities.includes(index)}
              onChange={() => toggleScarcityFilter(index)}
            >
              <Trans id={scarcity} render={({ translation }) => <TYPE.body>{translation}</TYPE.body>} />
            </Checkbox>
          ))}
        </Column>

        <Column gap={12}>
          <FilterName>
            <Trans>Serial numbers</Trans>
          </FilterName>
          <Checkbox value={filters.lowSerials} onChange={toggleLowSerialsFilter}>
            <TYPE.body>
              <Trans>Low serials</Trans>
            </TYPE.body>
          </Checkbox>
        </Column>

        <Column gap={16}>
          <FilterName>
            <Trans>Maximum price</Trans>
          </FilterName>
          <Slider
            unit="€"
            min={0}
            max={maximumPriceUpperBound}
            onInputChange={handleDebouncedMaximumPriceUpdate}
            onSlidingChange={setMaximumPrice}
            value={maximumPrice}
            onSliderRelease={debounceMaximumPrice}
          />
        </Column>
      </SidebarContent>
    </StyledMarketplaceSidebar>
  )
}
