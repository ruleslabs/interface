import { useCallback, useMemo } from 'react'
import gql from 'graphql-tag'
import { ScarcityName } from '@rulesorg/sdk-core'

import {
  CardsFilterInput,
  CardsQuery,
  CardsQueryVariables,
  CardsSortInput,
  CardsSortingType,
  SortingOption,
  useCardsQuery,
} from './__generated__/types-and-hooks'
import { Card } from 'src/types'

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

export function formatCardQueryData({ node: queryCard }: NonNullable<CardsQuery['cards']>['edges'][number]): Card {
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

export interface CardsFetcherParams {
  filter: CardsFilterInput
  sort?: CardsSortInput
  first?: number
  after?: string
}

export const CARD_MODELS_PAGE_SIZE = 25

const defaultCardModelsFetcherParams: Omit<CardsQueryVariables, 'filter'> = {
  first: CARD_MODELS_PAGE_SIZE,
  sort: { direction: SortingOption.Desc, type: CardsSortingType.Age },
}

export function useCards(params: CardsFetcherParams, skip?: boolean) {
  const variables = useMemo(() => ({ ...defaultCardModelsFetcherParams, ...params }), [params])

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
