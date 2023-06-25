import { useCallback, useMemo } from 'react'
import gql from 'graphql-tag'
import {
  HallOfFameQueryVariables,
  SortingOption,
  UsersSortingType,
  useHallOfFameQuery,
} from './__generated__/types-and-hooks'
import { constants } from '@rulesorg/sdk-core'

gql`
  query HallOfFame($season: Int!, $sort: UsersSortInput!, $after: String, $first: Int) {
    users(sort: $sort, after: $after, first: $first) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          username
          slug
          cScore(season: $season)
          rank(season: $season)
          profile {
            pictureUrl(derivative: "width=128")
            fallbackUrl(derivative: "width=128")
          }
        }
      }
    }
  }
`

// HOOKS

export const HALL_OF_FAME_PAGE_SIZE = 10

const defaultHallOfFameFetcherParams: Omit<HallOfFameQueryVariables, 'sort' | 'season'> = {
  first: HALL_OF_FAME_PAGE_SIZE,
}

export function useHallOfFame(season = constants.CURRENT_SEASON) {
  const variables: HallOfFameQueryVariables = useMemo(
    () => ({
      ...defaultHallOfFameFetcherParams,
      season,
      sort: {
        type: UsersSortingType[`CScoreSeason_${season}` as keyof typeof UsersSortingType],
        direction: SortingOption.Desc,
      },
    }),
    [season]
  )

  const { data, loading, fetchMore } = useHallOfFameQuery({ variables })
  const hasNext = data?.users?.pageInfo?.hasNextPage
  const loadMore = useCallback(
    () =>
      fetchMore({
        variables: {
          after: data?.users?.pageInfo?.endCursor,
        },
      }),
    [data?.users?.pageInfo?.endCursor, fetchMore]
  )

  const users = useMemo(() => data?.users?.edges?.map(({ node }) => node), [data?.users?.edges, data?.users])

  return useMemo(() => {
    return {
      data: users,
      hasNext,
      loading,
      loadMore,
    }
  }, [users, hasNext, loadMore, loading])
}
