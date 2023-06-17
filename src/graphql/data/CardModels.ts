import { useCallback, useMemo } from 'react'
import gql from 'graphql-tag'

import { CardModel } from 'src/types'
import {
  CardModelsFilterInput,
  CardModelsQuery,
  CardModelsQueryVariables,
  CardModelsSortInput,
  useCardModelsQuery,
} from './__generated__/types-and-hooks'
import { ScarcityName } from '@rulesorg/sdk-core'

gql`
  query CardModels($filter: CardModelsFilterInput!, $sort: CardModelsSortInput!, $after: String, $first: Int) {
    cardModels(filter: $filter, sort: $sort, after: $after, first: $first) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          id
          slug
          listedCardsCount
          pictureUrl(derivative: "width=512")
          videoUrl
          season
          lowSerialLowestAsk
          lowestAsk
          scarcity {
            name
          }
          artistName
        }
      }
    }
  }
`

export function formatCardModelQueryData({
  node: queryCardModel,
}: NonNullable<CardModelsQuery['cardModels']>['edges'][number]): CardModel {
  return {
    slug: queryCardModel.slug,
    listedCardsCount: queryCardModel.listedCardsCount,
    imageUrl: queryCardModel.pictureUrl ?? '',
    animationUrl: queryCardModel.videoUrl ?? '',
    season: queryCardModel.season,
    artistName: queryCardModel.artistName,
    scarcityName: queryCardModel.scarcity.name as ScarcityName,
    lowestAsk: queryCardModel.lowestAsk ?? '0x0',
    lowSerialLowestAsk: queryCardModel.lowSerialLowestAsk ?? '0x0',
  }
}

export interface CardModelsFetcherParams {
  filter: CardModelsFilterInput
  sort: CardModelsSortInput
  first?: number
  after?: string
}

export const CARD_MODELS_PAGE_SIZE = 25

const defaultCardModelsFetcherParams: Omit<CardModelsQueryVariables, 'filter' | 'sort'> = {
  first: CARD_MODELS_PAGE_SIZE,
}

export function useCardModels(params: CardModelsFetcherParams, skip?: boolean) {
  const variables = useMemo(() => ({ ...defaultCardModelsFetcherParams, ...params }), [params])

  const { data, loading, fetchMore } = useCardModelsQuery({ variables, skip })
  const hasNext = data?.cardModels?.pageInfo?.hasNextPage
  const loadMore = useCallback(
    () =>
      fetchMore({
        variables: {
          after: data?.cardModels?.pageInfo?.endCursor,
        },
      }),
    [data?.cardModels?.pageInfo?.endCursor, fetchMore]
  )

  const cardModels: CardModel[] | undefined = useMemo(
    () =>
      data?.cardModels?.edges?.map((queryCardModel) => {
        return formatCardModelQueryData(queryCardModel)
      }),
    [data?.cardModels?.edges, data?.cardModels]
  )

  return useMemo(() => {
    return {
      data: cardModels,
      hasNext,
      loading,
      loadMore,
    }
  }, [cardModels, hasNext, loadMore, loading])
}
