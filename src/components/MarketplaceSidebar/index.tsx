import React from 'react'
import styled from 'styled-components'
import { Seasons, ScarcityName } from '@rulesorg/sdk-core'
import { Trans } from '@lingui/macro'

import Column from '@/components/Column'
import Checkbox from '@/components/Checkbox'
import Slider from '@/components/Slider'
import { TYPE } from '@/styles/theme'
import {
  useMarketplaceFilters,
  useMarketplaceScarcityFilterToggler,
  useMarketplaceSeasonsFilterToggler,
  useMarketplaceSetMaximumPrice,
} from '@/state/search/hooks'

import Close from '@/images/close.svg'

const StyledClose = styled(Close)`
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
  top: 57px;
  bottom: 0;
  left: 0;
  z-index: 1;

  ${({ theme }) => theme.media.mediumGT`
    & ~ footer {
      left: 283px;
    }
  `}

  ${({ theme }) => theme.media.medium`
    top: 62px;
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

  const toggleTierFilter = useMarketplaceScarcityFilterToggler()
  const toggleSeasonFilter = useMarketplaceSeasonsFilterToggler()
  const setMaximumPrice = useMarketplaceSetMaximumPrice()

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
              value={filters.seasons.includes(+season)}
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
          {ScarcityName.map((scarcity: string) => (
            <Checkbox
              key={`checkbox-tier-${scarcity}`}
              value={filters.scarcities.includes(scarcity)}
              onChange={() => toggleTierFilter(scarcity)}
            >
              <Trans id={scarcity} render={({ translation }) => <TYPE.body>{translation}</TYPE.body>} />
            </Checkbox>
          ))}
        </Column>

        <Column gap={16}>
          <FilterName>
            <Trans>Maximum price</Trans>
          </FilterName>
          <Slider
            unit="€"
            max={maximumPriceUpperBound}
            onChange={setMaximumPrice}
            value={filters.maximumPrice ?? maximumPriceUpperBound}
          />
        </Column>
      </SidebarContent>
    </StyledMarketplaceSidebar>
  )
}
