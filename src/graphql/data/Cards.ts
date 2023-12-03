import { ScarcityName } from '@rulesorg/sdk-core'
import gql from 'graphql-tag'
import { useCallback, useMemo } from 'react'
import { Card } from 'src/types'

import {
  CardsFilterInput,
  CardsQuery,
  CardsQueryVariables,
  CardsSortingType,
  CardsSortInput,
  SortingOption,
  useCardsCountQuery,
  useCardsQuery,
} from './__generated__/types-and-hooks'

gql`
  query Cards($filter: CardsFilterInput!, $sort: CardsSortInput!, $after: String, $first: Int) {
    cards(filter: $filter, sort: $sort, after: $after, first: $first) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          id
          slug
          serialNumber
          listing {
            price
          }
          tokenId
          cardModel {
            slug
            pictureUrl(derivative: "width=1024")
            videoUrl
            season
            artistName
            scarcity {
              name
            }
          }
        }
      }
    }
  }
`

gql`
  query CardsCount($filter: CardsFilterInput!) {
    cardsCount(filter: $filter)
  }
`

function formatCardQueryData({ node: queryCard }: NonNullable<CardsQuery['cards']>['edges'][number]): Card {
  return {
    slug: queryCard.slug,
    serialNumber: queryCard.serialNumber,
    ask: queryCard.listing?.price,
    tokenId: queryCard.tokenId,
    cardModel: {
      slug: queryCard.cardModel.slug,
      imageUrl: queryCard.cardModel.pictureUrl ?? '',
      animationUrl: queryCard.cardModel.videoUrl ?? '',
      season: queryCard.cardModel.season,
      artistName: queryCard.cardModel.artistName,
      scarcityName: queryCard.cardModel.scarcity.name as ScarcityName,
    },
  }
}

interface CardsFetcherParams {
  filter: CardsFilterInput
  sort?: CardsSortInput
  first?: number
  after?: string
}

const CARDS_PAGE_SIZE = 25

const defaultCardsFetcherParams: Omit<CardsQueryVariables, 'filter'> = {
  first: CARDS_PAGE_SIZE,
  sort: { direction: SortingOption.Desc, type: CardsSortingType.Age },
}

export function useCards(params: CardsFetcherParams, skip?: boolean) {
  const variables = useMemo(() => ({ ...defaultCardsFetcherParams, ...params }), [params])

  const { data, loading, fetchMore } = useCardsQuery({ variables, skip })
  const hasNext = data?.cards?.pageInfo?.hasNextPage
  const loadMore = useCallback(
    () =>
      fetchMore({
        variables: {
          after: data?.cards?.pageInfo?.endCursor,
        },
      }),
    [data?.cards?.pageInfo?.endCursor, fetchMore]
  )

  const cards: Card[] | undefined = useMemo(
    () =>
      data?.cards?.edges?.map((queryCard) => {
        return formatCardQueryData(queryCard)
      }),
    [data?.cards?.edges, data?.cards]
  )

  return useMemo(() => {
    return {
      data: cards,
      hasNext,
      loading,
      loadMore,
    }
  }, [cards, hasNext, loadMore, loading])
}

// Cards count

interface CardsCountFetcherParams {
  filter: CardsFilterInput
}

export function useCardsCount(params: CardsCountFetcherParams, skip?: boolean) {
  const { data, loading } = useCardsCountQuery({ variables: params, skip })

  const cardsCount = data?.cardsCount

  return useMemo(() => {
    return {
      data: cardsCount,
      loading,
    }
  }, [cardsCount, loading])
}
