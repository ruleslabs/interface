import { useState, useCallback, useMemo } from 'react'
import { useQuery, gql } from '@apollo/client'
import { Plural, t } from '@lingui/macro'
import { useRouter } from 'next/router'

import DefaultLayout from '@/components/Layout'
import ProfileLayout from '@/components/Layout/Profile'
import GridHeader from '@/components/GridHeader'
import Section from '@/components/Section'
import CardModel from '@/components/CardModel'
import Grid from '@/components/Grid'
import { useSearchCards } from '@/state/search/hooks'
import { TYPE } from '@/styles/theme'
import EmptyTab, { EmptyCardsTabOfCurrentUser } from '@/components/EmptyTab'
import { useCurrentUser } from '@/state/user/hooks'

const CARD_CONTENT = `
  serialNumber
  onSale
  cardModel {
    slug
    pictureUrl(derivative: "width=1024")
    season
    artist {
      displayName
    }
  }
`

const QUERY_CARDS = gql`
  query ($ids: [ID!]!, $userId: ID!) {
    cardsInDeliveryForUser(userId: $userId) { ${CARD_CONTENT} }
    cardsByIds(ids: $ids) { ${CARD_CONTENT} }
  }
`

function Cards({ userId }: { userId: string }) {
  // current user
  const router = useRouter()
  const { username } = router.query
  const userSlug = typeof username === 'string' ? username.toLowerCase() : null

  const currentUser = useCurrentUser()
  const isCurrentUserProfile = currentUser?.slug === userSlug

  // sort
  const [sortDesc, setSortDesc] = useState(true)

  const toggleSort = useCallback(() => {
    setSortDesc(!sortDesc)
  }, [sortDesc, setSortDesc])

  const {
    hits: cardsHits,
    loading: cardsHitsLoading,
    error: cardsHitsError,
  } = useSearchCards({ facets: { ownerUserId: userId }, dateDesc: sortDesc })

  const cardIds = useMemo(
    () =>
      (cardsHits ?? []).reduce<string[]>((acc, hit: any) => {
        acc.push(hit.cardId)

        return acc
      }, []),
    [cardsHits]
  )

  // Query cards
  const cardsQuery = useQuery(QUERY_CARDS, { variables: { ids: cardIds, userId }, skip: !cardIds.length && !userId })

  // Aggregate cards
  const deliveredCards = cardsQuery.data?.cardsByIds ?? []
  const inDeliveryCards = cardsQuery.data?.cardsInDeliveryForUser ?? []
  const cards = useMemo(
    () => [...inDeliveryCards.map((card: any) => ({ ...card, inDelivery: true })), ...deliveredCards],
    [deliveredCards.length, inDeliveryCards.length]
  )

  // loading / error
  const isValid = !cardsQuery.error
  const isLoading = cardsQuery.loading

  return (
    <Section>
      <GridHeader sortTexts={['Newest', 'Oldest']} sortValue={sortDesc} onSortUpdate={toggleSort}>
        <TYPE.body>
          {!isValid ? (
            t`An error has occured`
          ) : isLoading ? (
            'Loading...'
          ) : (
            <Plural value={cards.length} _1="{0} card" other="{0} cards" />
          )}
        </TYPE.body>
      </GridHeader>
      {isValid && !isLoading && cards.length > 0 ? (
        <Grid gap={64}>
          {cards.map((card: any, index: number) => (
            <CardModel
              key={`user-card-${index}`}
              cardModelSlug={card.cardModel.slug}
              pictureUrl={card.cardModel.pictureUrl}
              onSale={card.onSale}
              serialNumber={card.serialNumber}
              inDelivery={card.inDelivery}
              season={card.cardModel.season}
              artistName={card.cardModel.artist.displayName}
            />
          ))}
        </Grid>
      ) : (
        isValid &&
        !isLoading &&
        (isCurrentUserProfile ? <EmptyCardsTabOfCurrentUser /> : <EmptyTab emptyText={t`No cards`} />)
      )}
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
