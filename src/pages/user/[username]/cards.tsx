import { useState, useCallback, useMemo } from 'react'
import { useQuery, gql } from '@apollo/client'

import DefaultLayout from '@/components/Layout'
import ProfileLayout from '@/components/Layout/profile'
import GridHeader from '@/components/GridHeader'
import Section from '@/components/Section'
import CardModel from '@/components/CardModel'
import Grid from '@/components/Grid'
import { useSearchCards } from '@/state/search/hooks'

const QUERY_CARDS = gql`
  query ($ids: [ID!]!) {
    cardsByIds(ids: $ids) {
      serialNumber
      onSale
      cardModel {
        slug
        pictureUrl(derivative: "width=512")
      }
    }
  }
`

function Cards({ userId }: { userId: string }) {
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

  const {
    data: cardsData,
    loading: cardsLoading,
    error: cardsError,
  } = useQuery(QUERY_CARDS, { variables: { ids: cardIds }, skip: !cardIds.length })

  const cards = cardsData?.cardsByIds ?? []
  const isValid = !cardsHitsError && !cardsError
  const isLoading = cardsHitsLoading || cardsLoading

  return (
    <Section>
      <GridHeader sortTexts={['Plus récentes', 'Moins récentes']} sortValue={sortDesc} onSortUpdate={toggleSort}>
        {!isValid
          ? 'An error has occured'
          : isLoading
          ? 'Loading...'
          : `${cards.length} carte${cards.length > 1 ? 's' : ''}`}
      </GridHeader>
      {isValid && !isLoading && (
        <Grid gap={64}>
          {cards.map((card: any, index: number) => (
            <CardModel
              key={`user-card-${index}`}
              cardModelSlug={card.cardModel.slug}
              pictureUrl={card.cardModel.pictureUrl}
              onSale={card.onSale}
              serialNumber={card.serialNumber}
            />
          ))}
        </Grid>
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