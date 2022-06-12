import { useState, useCallback } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import MarketplaceSidebar from '@/components/MarketplaceSidebar'
import Section from '@/components/Section'
import GridHeader from '@/components/GridHeader'
import CardModel from '@/components/CardModel'
import { TYPE } from '@/styles/theme'
import { ColumnCenter } from '@/components/Column'
import Row from '@/components/Row'
import Grid from '@/components/Grid'
import { useCardModelOnSale } from '@/state/search/hooks'
import Link from '@/components/Link'

const ComingSoon = styled(ColumnCenter)`
  background: ${({ theme }) => theme.primary1};
  padding: 12px 0;
  top: 57px;
  margin-left: 283px;
  right: 0;
  z-index: 1;
  justify-content: center;

  & a {
    text-decoration: underline;
  }

  ${({ theme }) => theme.media.medium`
    margin-left: 0;
  `}
`

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

export default function Marketplace() {
  // sort
  const [increaseSort, setIncreaseSort] = useState(true)

  const toggleSort = useCallback(() => {
    setIncreaseSort(!increaseSort)
  }, [increaseSort, setIncreaseSort])

  // filters sidebar
  const [isFiltersSidebarOpenOnMobile, setIsFiltersSidebarOpenOnMobile] = useState(false)

  const toggleFiltersOnMobile = useCallback(() => {
    setIsFiltersSidebarOpenOnMobile(!isFiltersSidebarOpenOnMobile)
  }, [isFiltersSidebarOpenOnMobile, setIsFiltersSidebarOpenOnMobile])

  const { cardModels, loading, error } = useCardModelOnSale('width=720')

  if (!!error || !!loading) {
    if (!!error) console.error(error)

    return null
  }

  return (
    <>
      <StyledMarketplaceSidebar isOpenOnMobile={isFiltersSidebarOpenOnMobile} dispatch={toggleFiltersOnMobile} />
      <ComingSoon>
        <TYPE.medium>
          <Trans>The marketplace will open early July.</Trans>
        </TYPE.medium>
        <TYPE.body>
          <Trans>
            Please&nbsp;
            <Link color="text1" href="https://discord.gg/DrfezKYUhH" target="_blank" underline>
              join our Discord
            </Link>
            <span>&nbsp;</span>
            for live updates.
          </Trans>
        </TYPE.body>
      </ComingSoon>
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
                <CardModel pictureUrl={cardModel.pictureUrl} cardModelSlug={cardModel.slug} />
                <TYPE.body textAlign="center">
                  <Trans>starting from</Trans>
                  <br />
                  <Row>
                    {+cardModel.lowestAskETH ?? '-'} ETH&nbsp;
                    <TYPE.body color="text2">
                      {cardModel.lowestAskEUR ? `(${cardModel.lowestAskEUR}€)` : null}
                    </TYPE.body>
                  </Row>
                </TYPE.body>
              </ColumnCenter>
            ))}
          </StyledGrid>
        </MarketplaceBody>
      </MainSection>
    </>
  )
}
