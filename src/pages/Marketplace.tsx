import { useState, useMemo } from 'react'
import styled from 'styled-components/macro'
import { WeiAmount } from '@rulesorg/sdk-core'
import { t } from '@lingui/macro'

import MarketplaceFilters from 'src/components/MarketplaceFilters'
import Section from 'src/components/Section'
import Column from 'src/components/Column'
import Row, { RowBetween } from 'src/components/Row'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import SortButton, { SortData } from 'src/components/Button/SortButton'
import { useMarketplaceFiltersModalToggle } from 'src/state/application/hooks'
import MarketplaceFiltersModal from 'src/components/MarketplaceFiltersModal'
import DefaultLayout from 'src/components/Layout'
import { NftCard } from 'src/components/nft/Card'

import { ReactComponent as HopperIcon } from 'src/images/hopper.svg'
import CollectionNfts from 'src/components/nft/Collection/CollectionNfts'
import { Badge } from 'src/types'
import { useCardModels } from 'src/graphql/data/CardModels'
import { CardModelsSortingType, SortingOption } from 'src/graphql/data/__generated__/types-and-hooks'
import { useMarketplaceFilters } from 'src/state/search/hooks'
import { IconButton } from 'src/components/Button'

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

// TODO: new sorting support
const sortsData: SortData<any>[] = [
  { name: 'Price: low to high', key: '', desc: true },
  { name: 'Price: high to low', key: '', desc: false },
]

function Marketplace() {
  const [sortIndex, setSortIndex] = useState(0)

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()
  // const etherPrice = useEtherPrice()

  // filters
  const marketplaceFilters = useMarketplaceFilters()

  // filters modal
  const toggleMarketplaceFiltersModal = useMarketplaceFiltersModalToggle()

  // sort
  const sort = useMemo(
    () => ({
      type: marketplaceFilters.lowSerials ? CardModelsSortingType.LowSerialLowestAsk : CardModelsSortingType.LowestAsk,
      direction: sortsData[sortIndex].desc ? SortingOption.Desc : SortingOption.Asc,
    }),
    [sortIndex, marketplaceFilters.lowSerials]
  )

  const {
    data: cardModels,
    loading,
    hasNext,
    loadMore,
  } = useCardModels({
    filter: {
      seasons: marketplaceFilters.seasons,
      scarcityAbsoluteIds: marketplaceFilters.scarcities,
      maxGweiPrice: '9999999999',
    },
    sort,
  })

  const cardModelComponents = useMemo(() => {
    if (!cardModels) return null

    return cardModels.map((cardModel) => {
      const lowestAsk = marketplaceFilters.lowSerials ? cardModel.lowSerialLowestAsk : cardModel.lowestAsk
      const parsedLowestAsk = lowestAsk ? WeiAmount.fromRawAmount(lowestAsk) : undefined

      return (
        <NftCard
          key={cardModel.slug}
          asset={{
            animationUrl: cardModel.animationUrl,
            imageUrl: cardModel.imageUrl,
            tokenId: cardModel.slug,
            scarcity: cardModel.scarcityName,
          }}
          display={{
            href: `/card/${cardModel.slug}`,
            primaryInfo: cardModel.artistName,
            secondaryInfo: t`${cardModel.listedCardsCount} offers`,
            subtitle: parsedLowestAsk
              ? t`from ${parsedLowestAsk.toSignificant(6)} ETH (€${weiAmountToEURValue(parsedLowestAsk)})`
              : undefined,
          }}
          badges={marketplaceFilters.lowSerials ? [Badge.LOW_SERIAL] : undefined}
        />
      )
    })
  }, [cardModels, marketplaceFilters.lowSerials])

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
            <MarketplaceFilters maximumPriceUpperBound={9999999999} />
          </FiltersWrapper>

          <GridWrapper>
            <CollectionNfts
              next={loadMore}
              hasNext={hasNext ?? false}
              dataLength={cardModels?.length ?? 0}
              loading={loading}
            >
              {cardModelComponents}
            </CollectionNfts>
          </GridWrapper>
        </Row>
      </StyledSection>

      <MarketplaceFiltersModal maximumPriceUpperBound={9999999999} />
    </>
  )
}

Marketplace.withLayout = () => (
  <DefaultLayout>
    <Marketplace />
  </DefaultLayout>
)

export default Marketplace
