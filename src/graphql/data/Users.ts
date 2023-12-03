import { constants } from '@rulesorg/sdk-core'
import gql from 'graphql-tag'
import { useCallback, useMemo } from 'react'

import {
  CurrentUserHallOfFameQuery,
  HallOfFameQueryVariables,
  SortingOption,
  useCurrentUserHallOfFameQuery,
  useHallOfFameQuery,
  UsersFilterInput,
  UsersQueryVariables,
  UsersSortingType,
  UsersSortInput,
  useUsersQuery,
} from './__generated__/types-and-hooks'

gql`
  query Users($filter: UsersFilterInput!, $sort: UsersSortInput!, $after: String, $first: Int) {
    users(filter: $filter, sort: $sort, after: $after, first: $first) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          id
          slug
          username
          starknetWallet {
            address
          }
          profile {
            pictureUrl(derivative: "width=128")
            fallbackUrl(derivative: "width=128")
            certified
          }
        }
      }
    }
  }
`

gql`
  query HallOfFame($season: Int!, $sort: UsersSortInput!, $after: String, $first: Int) {
    users(filter: {}, sort: $sort, after: $after, first: $first) {
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

gql`
  query CurrentUserHallOfFame($season: Int!) {
    currentUser {
      cScore(season: $season)
      rank(season: $season)
    }
  }
`

// USERS SEARCH

interface CardsFetcherParams {
  filter: UsersFilterInput
  sort?: UsersSortInput
  first?: number
  after?: string
}

const USERS_PAGE_SIZE = 10

const defaultUsersFetcherParams: Omit<UsersQueryVariables, 'filter'> = {
  first: USERS_PAGE_SIZE,
  sort: { direction: SortingOption.Desc, type: UsersSortingType.Certified },
}

export function useUsers(params: CardsFetcherParams, skip?: boolean) {
  const variables = useMemo(() => ({ ...defaultUsersFetcherParams, ...params }), [params])

  const { data, loading, fetchMore } = useUsersQuery({ variables, skip })
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

// HALL OF FAME

const HALL_OF_FAME_PAGE_SIZE = 10

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

export function useCurrentUserHallOfFame(season = constants.CURRENT_SEASON) {
  const { data: queryData, loading } = useCurrentUserHallOfFameQuery({ variables: { season } })

  const queryCurrentUser = queryData?.currentUser as NonNullable<CurrentUserHallOfFameQuery['currentUser']>
  return useMemo(() => {
    return {
      data: queryCurrentUser,
      loading,
    }
  }, [loading, queryCurrentUser])
}
