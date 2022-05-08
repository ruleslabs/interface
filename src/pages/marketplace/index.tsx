import { useState, useCallback } from 'react'
import styled from 'styled-components'

import MarketplaceSidebar from '@/components/MarketplaceSidebar'
import Section from '@/components/Section'
import GridHeader from '@/components/GridHeader'
import CardModel from '@/components/CardModel'
import { TYPE } from '@/styles/theme'
import { ColumnCenter } from '@/components/Column'
import Grid from '@/components/Grid'
import { useCardModelOnSale } from '@/state/search/hooks'

const MarketplaceBody = styled.div`
  margin: 0 64px 32px 347px;
`

const StyledGrid = styled(Grid)`
  ${({ theme }) => theme.media.extraSmall`
    grid-template-columns: repeat(1, 1fr);
    padding: 0 32px;
  `}
`

export default function Marketplace() {
  const [increaseSort, setIncreaseSort] = useState(true)

  const toggleSort = useCallback(() => {
    setIncreaseSort(!increaseSort)
  }, [increaseSort, setIncreaseSort])

  const { cardModels, loading, error } = useCardModelOnSale('width=720')

  if (!!error || !!loading) {
    if (!!error) console.error(error)

    return null
  }

  return (
    <>
      <MarketplaceSidebar />
      <Section size="max" marginTop="44px">
        <MarketplaceBody>
          <GridHeader
            sortTexts={['Prix croissant', 'Prix décroissant']}
            sortValue={increaseSort}
            onSortUpdate={toggleSort}
          />
          <StyledGrid>
            {cardModels.map((cardModel: any, index: number) => (
              <ColumnCenter gap={12} key={`mktp-card-${index}`}>
                <CardModel pictureUrl={cardModel.pictureUrl} cardModelSlug={cardModel.slug} />
                <TYPE.body textAlign="center">
                  starting from <br />
                  {cardModel.lowestAskEUR ?? '-'} €
                </TYPE.body>
              </ColumnCenter>
            ))}
          </StyledGrid>
        </MarketplaceBody>
      </Section>
    </>
  )
}
