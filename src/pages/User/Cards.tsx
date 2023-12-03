import { Plural, t, Trans } from '@lingui/macro'
import { WeiAmount } from '@rulesorg/sdk-core'
import { useMemo, useState } from 'react'
import { IconButton, PrimaryButton, SecondaryButton } from 'src/components/Button'
import SortButton, { SortsData } from 'src/components/Button/SortButton'
import EmptyTab, { EmptyCardsTabOfCurrentUser } from 'src/components/EmptyTab'
import CardsFilters from 'src/components/Filters/Cards'
import { CardsFiltersModal } from 'src/components/FiltersModal'
import GiftModal from 'src/components/GiftModal'
import DefaultLayout from 'src/components/Layout'
import ProfileLayout from 'src/components/Layout/Profile'
import { NftCard } from 'src/components/nft/Card'
import CollectionNfts from 'src/components/nft/Collection/CollectionNfts'
import { RowBetween, RowCenter } from 'src/components/Row'
import Section from 'src/components/Section'
import { CardsSortingType, SortingOption } from 'src/graphql/data/__generated__/types-and-hooks'
import { useCards, useCardsCount } from 'src/graphql/data/Cards'
import useAssetsSelection from 'src/hooks/useAssetsSelection'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import useSearchedUser from 'src/hooks/useSearchedUser'
import { ReactComponent as HopperIcon } from 'src/images/hopper.svg'
import { ReactComponent as Present } from 'src/images/present.svg'
import { useFiltersModalToggle, useOfferModalToggle } from 'src/state/application/hooks'
import { useCardsFilters } from 'src/state/search/hooks'
import { TYPE } from 'src/styles/theme'
import Box from 'src/theme/components/Box'
import { Column, Row } from 'src/theme/components/Flex'
import styled from 'styled-components/macro'

import * as styles from './Cards.css'

// css

const StyledPresent = styled(Present)`
  width: 16px;
  fill: ${({ theme }) => theme.text1};
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

const GridHeader = styled(RowBetween)`
  align-items: center;
  padding: 0 16px 12px;
  width: 100%;

  ${({ theme }) => theme.media.medium`
    align-items: flex-start;
    flex-direction: column;
    gap: 32px;
  `}
`

const SelectionButtonWrapper = styled(RowCenter)`
  gap: 12px;

  ${({ theme }) => theme.media.medium`
    justify-content: space-between;
    width: 100%;
  `}
`

const SelectionButton = styled(SecondaryButton)`
  padding: 4px 12px;
  min-height: unset;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 400;
  background: ${({ theme }) => theme.bg3}80;

  &:hover {
    background: ${({ theme }) => theme.bg3};
  }
`

const SelectedCardsActionWrapper = styled(Row)<{ active: boolean }>`
  position: fixed;
  left: 16px;
  right: 16px;
  justify-content: center;
  z-index: 1;

  ${({ active }) =>
    active
      ? `
        bottom: 24px;
        transition: bottom 300ms cubic-bezier(0.3, 0.1, 0.5, 1.6);
      `
      : `
        bottom: -100px;
        transition: bottom 500ms cubic-bezier(1, -1.1, 0.5, 0.8);
      `}
`

const SelectedCardsAction = styled(RowCenter)`
  background: ${({ theme }) => theme.bg2};
  gap: 16px;
  padding: 8px 8px 8px 16px;
  border-radius: 6px;
  box-shadow: 0 0 8px ${({ theme }) => theme.black}80;

  ${({ theme }) => theme.media.small`
    flex-direction: column;
    padding: 12px;
  `}
`

const SelectedCardsButtonsWrapper = styled(Row)`
  gap: 8px;

  & > * {
    flex: 1;
    flex-basis: auto;
  }

  ${({ theme }) => theme.media.small`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  `}
`

const useSortsData = (): SortsData<CardsSortingType> =>
  useMemo(
    () => [
      { name: t`Newest`, key: CardsSortingType.Age, desc: true },
      { name: t`Oldest`, key: CardsSortingType.Age, desc: false },
      { name: t`Low serial`, key: CardsSortingType.Serial, desc: false },
      { name: t`High serial`, key: CardsSortingType.Serial, desc: true },
      { name: t`Price: low to high`, key: CardsSortingType.Price, desc: false },
      { name: t`Price: high to low`, key: CardsSortingType.Price, desc: true },
      { name: t`Alphabetical A-Z`, key: CardsSortingType.Name, desc: false },
      { name: t`Alphabetical Z-A`, key: CardsSortingType.Name, desc: true },
    ],
    []
  )

function UserCards() {
  const [sortIndex, setSortIndex] = useState(0)
  const [listings] = useState<{ [tokenId: string]: string }>({})

  // sorts data
  const sortsData = useSortsData()

  // filters
  const cardsFilters = useCardsFilters()

  // filters modal
  const toggleCardsFiltersModal = useFiltersModalToggle()

  // sort
  const sort = useMemo(
    () => ({
      type: sortsData[sortIndex].key,
      direction: sortsData[sortIndex].desc ? SortingOption.Desc : SortingOption.Asc,
    }),
    [sortIndex]
  )

  // current user
  const [user] = useSearchedUser()

  // modals
  const toggleOfferModal = useOfferModalToggle()

  // cards selection
  const { selectedTokenIds, selectionModeEnabled, toggleSelectionMode } = useAssetsSelection()

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  const {
    data: cards,
    loading,
    hasNext,
    loadMore,
  } = useCards({
    filter: {
      ownerStarknetAddress: user?.address ?? '0x0',
      seasons: cardsFilters.seasons,
      scarcityAbsoluteIds: cardsFilters.scarcities,
    },
    sort,
  })

  const { data: cardsCount } = useCardsCount({
    filter: {
      ownerStarknetAddress: user?.address ?? '0x0',
      seasons: cardsFilters.seasons,
      scarcityAbsoluteIds: cardsFilters.scarcities,
    },
  })

  const cardsComponents = useMemo(() => {
    if (!cards) return null

    return cards.map((card) => {
      const price = card.ask ?? listings[card.tokenId]
      const parsedPrice = price && WeiAmount.fromRawAmount(price)

      return (
        <NftCard
          key={card.slug}
          asset={{
            animationUrl: card.cardModel.animationUrl,
            imageUrl: card.cardModel.imageUrl,
            tokenId: card.tokenId,
            scarcity: card.cardModel.scarcityName,
          }}
          display={{
            href: `/card/${card.cardModel.slug}/${card.serialNumber}`,
            primaryInfo: card.cardModel.artistName,
            secondaryInfo: `#${card.serialNumber}`,
            subtitle: parsedPrice
              ? `${parsedPrice.toSignificant(6)} ETH (€${weiAmountToEURValue(parsedPrice)})`
              : undefined,
            status: parsedPrice ? 'onSale' : undefined,
          }}
        />
      )
    })
  }, [cards, listings])

  console.log(cardsCount)

  if (!user) return null

  return (
    <>
      <Section>
        <Row gap="32" alignItems="flex-start">
          <Box className={styles.sidebaseContainer}>
            <CardsFilters />
          </Box>

          <Column gap="16">
            <GridHeader>
              <SelectionButtonWrapper>
                {cardsCount && (
                  <>
                    <TYPE.body>
                      <Plural value={cardsCount} _1="{cardsCount} card" other="{cardsCount} cards" />
                    </TYPE.body>

                    {user.isCurrentUser && (
                      <SelectionButton onClick={toggleSelectionMode}>
                        {selectionModeEnabled ? t`Cancel` : t`Select`}
                      </SelectionButton>
                    )}
                  </>
                )}
              </SelectionButtonWrapper>

              <Row className={styles.searchButtonsContainer}>
                <HopperIconButton onClick={toggleCardsFiltersModal} square>
                  <HopperIcon />
                </HopperIconButton>

                <SortButton sortsData={sortsData} onChange={setSortIndex} sortIndex={sortIndex} />
              </Row>
            </GridHeader>

            <CollectionNfts
              next={loadMore}
              hasNext={hasNext ?? false}
              dataLength={cards?.length ?? 0}
              loading={loading}
            >
              {cardsComponents}
            </CollectionNfts>

            {!loading &&
              !cardsCount &&
              (user.isCurrentUser ? <EmptyCardsTabOfCurrentUser /> : <EmptyTab emptyText={t`No cards`} />)}
          </Column>
        </Row>
      </Section>

      <SelectedCardsActionWrapper active={selectedTokenIds.length > 0}>
        <SelectedCardsAction>
          <TYPE.body>
            <Plural value={selectedTokenIds.length} _1="{0} card selected" other="{0} cards selected" />
          </TYPE.body>

          <SelectedCardsButtonsWrapper>
            <PrimaryButton onClick={toggleOfferModal}>
              <RowCenter justify="center" gap={4}>
                <StyledPresent />
                <Trans>Gift</Trans>
              </RowCenter>
            </PrimaryButton>
          </SelectedCardsButtonsWrapper>
        </SelectedCardsAction>
      </SelectedCardsActionWrapper>

      <GiftModal tokenIds={selectedTokenIds} />
      <CardsFiltersModal />
    </>
  )
}

UserCards.withLayout = () => (
  <DefaultLayout>
    <ProfileLayout>
      <UserCards />
    </ProfileLayout>
  </DefaultLayout>
)

export default UserCards
