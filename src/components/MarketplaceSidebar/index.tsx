import styled from 'styled-components'
import { Seasons, Scarcity } from '@rulesorg/sdk-core'

import Checkbox from '@/components/Checkbox'
import Slider from '@/components/Slider'
import { TYPE } from '@/styles/theme'
import { useMarketplaceFilters, useTiersFilterToggler, useSeasonsFilterToggler } from '@/state/search/hooks'

const StyledMarketplaceSidebar = styled.div`
  background: ${({ theme }) => theme.bg2};
  position: fixed;
  width: 283px;
  top: 57px;
  bottom: 0;
  left: 0;
  z-index: 1;
  padding: 40px 0 0;
`

const SidebarContent = styled.div`
  position: absolute;
  top: 40px;
  bottom: 40px;
  left: 40px;
  right: 40px;
  display: flex;
  flex-direction: column;
  gap: 28px;
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

const FilterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export default function MarketplaceSidebar() {
  const filters = useMarketplaceFilters()

  const toggleTierFilter = useTiersFilterToggler()
  const toggleSeasonFilter = useSeasonsFilterToggler()

  return (
    <StyledMarketplaceSidebar>
      <SidebarContent>
        <SidebarTitle>Filters</SidebarTitle>

        <FilterWrapper>
          <FilterName>Seasons</FilterName>
          {Object.keys(Seasons).map((season: string) => (
            <Checkbox
              key={`checkbox-season-${season}`}
              value={filters.seasons.includes(+season)}
              label={Seasons[+season].name}
              onChange={() => toggleSeasonFilter(+season)}
            />
          ))}
        </FilterWrapper>

        <FilterWrapper>
          <FilterName>Scarcities</FilterName>
          {Object.keys(Scarcity).map((scarcity: string) => (
            <Checkbox
              key={`checkbox-tier-${scarcity}`}
              value={filters.tiers.includes(scarcity)}
              label={Scarcity[scarcity as keyof typeof Scarcity]}
              onChange={() => toggleTierFilter(scarcity)}
            />
          ))}
        </FilterWrapper>

        <FilterWrapper>
          <FilterName>Price</FilterName>
          <Slider unit="€" max={100_000} />
        </FilterWrapper>
      </SidebarContent>
    </StyledMarketplaceSidebar>
  )
}
