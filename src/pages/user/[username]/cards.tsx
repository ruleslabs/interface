import { useState, useCallback } from 'react'
import styled from 'styled-components'
import { useLazyQuery, gql } from '@apollo/client'
import { t, Trans, Plural } from '@lingui/macro'
import { useRouter } from 'next/router'

import DefaultLayout from '@/components/Layout'
import ProfileLayout from '@/components/Layout/Profile'
import { RowBetween } from '@/components/Row'
import Column from '@/components/Column'
import Section from '@/components/Section'
import CardModel from '@/components/CardModel'
import Grid from '@/components/Grid'
import { useSearchCards, CardsSortingKey } from '@/state/search/hooks'
import { TYPE } from '@/styles/theme'
import EmptyTab, { EmptyCardsTabOfCurrentUser } from '@/components/EmptyTab'
import { useCurrentUser } from '@/state/user/hooks'
import useCardsPendingStatus from '@/hooks/useCardsPendingStatus'
import { RowButton } from '@/components/Button'
import Hover from '@/components/AnimatedIcon/hover'
import { PaginationSpinner } from '@/components/Spinner'
import useInfiniteScroll from '@/hooks/useInfiniteScroll'

const CARD_CONTENT = `
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
    season
    artist {
      displayName
    }
  }
`

// css

const CARDS_QUERY = gql`
  query ($ids: [ID!]!) {
    cardsByIds(ids: $ids) { ${CARD_CONTENT} }
  }
`

const CARDS_IN_DELIVERY_QUERY = gql`
  query ($userId: ID!) {
    cardsInDeliveryForUser(userId: $userId) { ${CARD_CONTENT} }
  }
`

const GridHeader = styled(RowBetween)`
  margin-bottom: 32px;
  padding: 0 8px;
  align-items: center;
`

const SortButton = styled(RowButton)`
  position: relative;
  border: solid 1px ${({ theme }) => theme.text2}80;
  border-radius: 3px;
  padding: 8px 16px;

  &:hover {
    border-color: ${({ theme }) => theme.text2};
  }
`

const Dropdown = styled(Column)<{ isOpen: boolean }>`
  ${({ isOpen }) => !isOpen && 'display: none;'}
  position: absolute;
  background: ${({ theme }) => theme.bg2};
  top: 38px;
  right: 0;
  padding: 8px 0;
  min-width: 250px;
  z-index: 1;

  & > * {
    padding: 12px 40px;
    white-space: nowrap;
    width: 100%;
    text-align: right;
  }

  & > *:hover {
    background: ${({ theme }) => theme.bg3};
  }
`

const sorts: Array<{
  name: string
  key: CardsSortingKey
  desc: boolean
}> = [
  {
    name: 'Newest',
    key: 'txIndexDesc',
    desc: true,
  },
  {
    name: 'Oldest',
    key: 'txIndexAsc',
    desc: false,
  },
  {
    name: 'Low serial',
    key: 'serialAsc',
    desc: false,
  },
  {
    name: 'High serial',
    key: 'serialDesc',
    desc: true,
  },
  {
    name: 'Price: low to high',
    key: 'lastPriceAsc',
    desc: false,
  },
  {
    name: 'Price: high to low',
    key: 'lastPriceDesc',
    desc: true,
  },
  {
    name: 'Alphabetical A-Z',
    key: 'artistAsc',
    desc: false,
  },
  {
    name: 'Alphabetical Z-A',
    key: 'artistDesc',
    desc: true,
  },
]

interface CardsProps {
  userId: string
  address: string
}

function Cards({ userId, address }: CardsProps) {
  // current user
  const router = useRouter()
  const { username } = router.query
  const userSlug = typeof username === 'string' ? username.toLowerCase() : null

  const currentUser = useCurrentUser()
  const isCurrentUserProfile = currentUser?.slug === userSlug

  // tables
  const [cards, setCards] = useState<any[]>([])

  // sort button
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const toggleSortDropdown = useCallback(() => setSortDropdownOpen(!sortDropdownOpen), [sortDropdownOpen])

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

  // search cards
  const onPageFetched = useCallback(
    (hits: any, pageNumber: number) => {
      if (!pageNumber) setCards([])

      queryCardsData({
        variables: {
          ids: hits.map((hit: any) => hit.objectID),
          userId,
        },
        skip: !userId,
      })
    },
    [queryCardsData]
  )
  const cardsSearch = useSearchCards({
    facets: { ownerStarknetAddress: address },
    sortingKey: sorts[sortIndex].key,
    skip: !address,
    onPageFetched,
  })

  // pending status
  const pendingsStatus = useCardsPendingStatus(cards)

  // loading
  const isLoading = cardsSearch.loading || cardsQuery.loading

  // infinite scroll
  const lastTxRef = useInfiniteScroll({ nextPage: cardsSearch.nextPage, loading: isLoading })

  return (
    <Section>
      {cards.length > 0 && (
        <GridHeader>
          <TYPE.body>
            <Plural value={cards.length} _1="{0} card" other="{0} cards" />
          </TYPE.body>

          <SortButton onClick={toggleSortDropdown}>
            <TYPE.body>
              <Trans id={sorts[sortIndex].name} render={({ translation }) => <>{translation}</>} />
            </TYPE.body>

            <Hover width="16" height="16" reverse={!sorts[sortIndex].desc} />

            <Dropdown isOpen={sortDropdownOpen}>
              {sorts.map((sort, index) => (
                <TYPE.body key={index} onClick={() => setSortIndex(index)}>
                  <Trans id={sort.name} render={({ translation }) => <>{translation}</>} />
                </TYPE.body>
              ))}
            </Dropdown>
          </SortButton>
        </GridHeader>
      )}

      <Grid gap={64}>
        {cards.map((card, index) => (
          <CardModel
            key={card.slug}
            innerRef={index + 1 === cards.length ? lastTxRef : undefined}
            cardModelSlug={card.cardModel.slug}
            pictureUrl={card.cardModel.pictureUrl}
            onSale={card.onSale}
            pendingStatus={pendingsStatus[index] ?? undefined}
            serialNumber={card.serialNumber}
            inDelivery={card.inDelivery}
            season={card.cardModel.season}
            artistName={card.cardModel.artist.displayName}
          />
        ))}
      </Grid>

      {!isLoading &&
        !cards.length &&
        (isCurrentUserProfile ? <EmptyCardsTabOfCurrentUser /> : <EmptyTab emptyText={t`No cards`} />)}

      <PaginationSpinner loading={isLoading} />
    </Section>
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
