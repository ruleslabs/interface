import { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { useLazyQuery, useQuery, gql } from '@apollo/client'
import { t, Trans, Plural } from '@lingui/macro'
import { useRouter } from 'next/router'

import DefaultLayout from '@/components/Layout'
import ProfileLayout from '@/components/Layout/Profile'
import Row, { RowBetween, RowCenter } from '@/components/Row'
import Section from '@/components/Section'
import CardModel from '@/components/CardModel'
import Grid from '@/components/Grid'
import { useSearchCards, CardsSortingKey } from '@/state/search/hooks'
import { TYPE } from '@/styles/theme'
import EmptyTab, { EmptyCardsTabOfCurrentUser } from '@/components/EmptyTab'
import { useCurrentUser } from '@/state/user/hooks'
import useCardsPendingStatusMap from '@/hooks/useCardsPendingStatusMap'
import { PaginationSpinner } from '@/components/Spinner'
import useInfiniteScroll from '@/hooks/useInfiniteScroll'
import SortButton, { SortsData } from '@/components/Button/SortButton'
import { PrimaryButton, SecondaryButton } from '@/components/Button'
import CreateOfferModal from '@/components/MarketplaceModal/CreateOffer'
import { useCreateOfferModalToggle, useOfferModalToggle } from '@/state/application/hooks'

import Present from '@/images/present.svg'
import GiftModal from '@/components/GiftModal'

// css

const CARDS_QUERY = gql`
  query ($ids: [ID!]!) {
    cardsByIds(ids: $ids) {
      id
      slug
      serialNumber
      onSale
      inTransfer
      inOfferCreation
      inOfferCancelation
      inOfferAcceptance
      cardModel {
        slug
        pictureUrl(derivative: "width=1024")
        videoUrl
        season
        artist {
          displayName
        }
      }
    }
  }
`

const CARDS_IN_DELIVERY_QUERY = gql`
  query ($userId: ID!) {
    cardsInDeliveryForUser(userId: $userId) {
      id
      slug
      serialNumber
      cardModel {
        slug
        pictureUrl(derivative: "width=1024")
        season
        artist {
          displayName
        }
      }
    }
  }
`

const StyledPresent = styled(Present)`
  width: 16px;
  fill: ${({ theme }) => theme.text1};
`

const StickyWrapper = styled.div`
  margin: 16px 0;
  position: sticky;
  z-index: 1;
  top: ${({ theme }) => theme.size.headerHeight}px;
  background: ${({ theme }) => theme.bg1};
  box-shadow: 0 4px 4px ${({ theme }) => theme.bg1}80;

  ${({ theme }) => theme.media.medium`
    top: ${theme.size.headerHeightMedium}px;
  `}
`

const GridHeader = styled(RowBetween)`
  align-items: center;
  padding: 12px 16px;
`

const SelectionButtonWrapper = styled(RowCenter)`
  gap: 12px;

  ${({ theme }) => theme.media.extraSmall`
    flex-direction: column;
    gap: 6px
  `}
`

const SelectionButton = styled(SecondaryButton)`
  padding: 4px 12px;
  min-height: unset;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 400;
  background: ${({ theme }) => theme.bg3}80;

  :hover {
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
  border-radius: 3px;
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

const sortsData: SortsData<CardsSortingKey> = [
  { name: 'Newest', key: 'txIndexDesc', desc: true },
  { name: 'Oldest', key: 'txIndexAsc', desc: false },
  { name: 'Low serial', key: 'serialAsc', desc: false },
  { name: 'High serial', key: 'serialDesc', desc: true },
  { name: 'Price: low to high', key: 'lastPriceAsc', desc: false },
  { name: 'Price: high to low', key: 'lastPriceDesc', desc: true },
  { name: 'Alphabetical A-Z', key: 'artistAsc', desc: false },
  { name: 'Alphabetical Z-A', key: 'artistDesc', desc: true },
]

interface CardsProps {
  userId: string
  address: string
}

function Cards({ userId, address }: CardsProps) {
  // router
  const router = useRouter()
  const { username } = router.query
  const userSlug = typeof username === 'string' ? username.toLowerCase() : null

  // current user
  const currentUser = useCurrentUser()
  const isCurrentUserProfile = currentUser?.slug === userSlug

  // modals
  const toggleCreateOfferModal = useCreateOfferModalToggle()
  const toggleOfferModal = useOfferModalToggle()

  // tables
  const [cards, setCards] = useState<any[]>([])

  // sort
  const [sortIndex, setSortIndex] = useState(0)

  // query cards data
  const onCardsQueryCompleted = useCallback(
    (data: any) => {
      setCards(cards.concat(data.cardsByIds))
    },
    [cards.length]
  )
  const [queryCardsData, cardsQuery] = useLazyQuery(CARDS_QUERY, {
    onCompleted: onCardsQueryCompleted,
    fetchPolicy: 'cache-and-network',
  })

  // query cards in delivery data
  const cardsInDeliveryQuery = useQuery(CARDS_IN_DELIVERY_QUERY, { variables: { userId }, skip: !userId })
  const cardsInDelivery = cardsInDeliveryQuery.data?.cardsInDeliveryForUser ?? []

  // cards count
  const [deliveredCardsCount, setDeliveredCardsCount] = useState(0)
  const cardsCount = useMemo(
    () => deliveredCardsCount + cardsInDelivery.length,
    [cardsInDelivery.length, deliveredCardsCount]
  )

  // search cards
  const onPageFetched = useCallback(
    (hits, { pageNumber, totalHitsCount }) => {
      if (!pageNumber) setCards([])

      queryCardsData({ variables: { ids: hits.map((hit: any) => hit.objectID) } })

      setDeliveredCardsCount(totalHitsCount)
    },
    [queryCardsData]
  )
  const cardsSearch = useSearchCards({
    facets: { ownerStarknetAddress: address },
    sortingKey: sortsData[sortIndex].key,
    skip: !address,
    onPageFetched,
  })

  // pending status
  const pendingsStatus = useCardsPendingStatusMap(cards)

  // loading
  const isLoading = cardsSearch.loading || cardsQuery.loading || cardsInDelivery.loading

  // infinite scroll
  const lastTxRef = useInfiniteScroll({ nextPage: cardsSearch.nextPage, loading: isLoading })

  // Selection feature
  const [selectionModeEnabled, setSelectionModeEnabled] = useState(false)
  const [selectedCardsIds, setSelectedCardsSlugs] = useState<string[]>([])

  // toggle selection mode
  const toggleSelectionMode = useCallback(() => {
    if (selectionModeEnabled) setSelectedCardsSlugs([]) // clear selection
    setSelectionModeEnabled(!selectionModeEnabled) // disable selection mode
  }, [selectionModeEnabled])

  // cards selection
  const toggleCardSelection = useCallback(
    (cardId: string) => {
      if (selectedCardsIds.includes(cardId)) setSelectedCardsSlugs(selectedCardsIds.filter((id) => cardId !== id))
      else setSelectedCardsSlugs(selectedCardsIds.concat(cardId))
    },
    [selectedCardsIds.length]
  )

  // offer creation
  const onSuccessfulAction = useCallback(
    (cardStateKey: string) => {
      const selectedCardsIdsSet = new Set(selectedCardsIds)

      toggleSelectionMode()
      setCards((state) =>
        state.map((card) => (selectedCardsIdsSet.has(card.id) ? { ...card, [cardStateKey]: true } : card))
      )
    },
    [toggleSelectionMode, selectedCardsIds.length]
  )

  const onSuccessfulOfferCreation = useCallback(() => onSuccessfulAction('inOfferCreation'), [onSuccessfulAction])
  const onSuccessfulGift = useCallback(() => onSuccessfulAction('inTransfer'), [onSuccessfulAction])

  return (
    <>
      <StickyWrapper>
        {cardsCount > 0 && (
          <Section marginBottom="0px">
            <GridHeader>
              <SelectionButtonWrapper>
                <TYPE.body>
                  <Plural value={cardsCount} _1="{cardsCount} card" other="{cardsCount} cards" />
                </TYPE.body>

                {isCurrentUserProfile && (
                  <SelectionButton onClick={toggleSelectionMode}>
                    {selectionModeEnabled ? t`Cancel` : t`Select`}
                  </SelectionButton>
                )}
              </SelectionButtonWrapper>

              <SortButton sortsData={sortsData} onChange={setSortIndex} sortIndex={sortIndex} />
            </GridHeader>
          </Section>
        )}
      </StickyWrapper>

      <Section>
        <Grid>
          {cardsInDelivery.map((card: any) => (
            <CardModel
              key={card.slug}
              cardModelSlug={card.cardModel.slug}
              pictureUrl={card.cardModel.pictureUrl}
              serialNumber={card.serialNumber}
              season={card.cardModel.season}
              artistName={card.cardModel.artist.displayName}
              inDelivery
            />
          ))}
          {cards.map((card: any, index) => (
            <CardModel
              key={card.slug}
              innerRef={index + 1 === cards.length ? lastTxRef : undefined}
              cardModelSlug={card.cardModel.slug}
              pictureUrl={card.cardModel.pictureUrl}
              videoUrl={card.cardModel.videoUrl}
              onSale={card.onSale}
              pendingStatus={pendingsStatus[card.id] ?? undefined}
              serialNumber={card.serialNumber}
              season={card.cardModel.season}
              artistName={card.cardModel.artist.displayName}
              selectable={selectionModeEnabled && !pendingsStatus[card.id]}
              selected={selectedCardsIds.includes(card.id)}
              onClick={selectionModeEnabled ? () => toggleCardSelection(card.id) : undefined}
            />
          ))}
        </Grid>

        {!isLoading &&
          !cardsCount &&
          (isCurrentUserProfile ? <EmptyCardsTabOfCurrentUser /> : <EmptyTab emptyText={t`No cards`} />)}

        <PaginationSpinner loading={isLoading} />
      </Section>

      <SelectedCardsActionWrapper active={selectedCardsIds.length > 0}>
        <SelectedCardsAction>
          <TYPE.body>
            <Plural value={selectedCardsIds.length} _1="{0} card selected" other="{0} cards selected" />
          </TYPE.body>

          <SelectedCardsButtonsWrapper>
            <PrimaryButton onClick={toggleCreateOfferModal}>
              <Trans>Place for Sale</Trans>
            </PrimaryButton>

            <SecondaryButton onClick={toggleOfferModal}>
              <RowCenter justify="center" gap={4}>
                <StyledPresent />
                <Trans>Gift</Trans>
              </RowCenter>
            </SecondaryButton>
          </SelectedCardsButtonsWrapper>
        </SelectedCardsAction>
      </SelectedCardsActionWrapper>

      <CreateOfferModal cardsIds={selectedCardsIds} onSuccess={onSuccessfulOfferCreation} />
      <GiftModal cardsIds={selectedCardsIds} onSuccess={onSuccessfulGift} />
    </>
  )
}

Cards.getLayout = (page: JSX.Element) => {
  return (
    <DefaultLayout>
      <ProfileLayout>{page}</ProfileLayout>
    </DefaultLayout>
  )
}

export default Cards
