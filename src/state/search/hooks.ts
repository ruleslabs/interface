import { gql, useLazyQuery } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'src/state/hooks'

import {
  updateCardsScarcityFilter,
  updateCardsSeasonsFilter,
  updateMarketplaceLowSerialsFilter,
  updateMarketplaceScarcityFilter,
  updateMarketplaceSeasonsFilter,
} from './actions'

export const ASSETS_PAGE_SIZE = 25

const ALL_CURRENT_USER_NOTIFICATIONS_QUERY = gql`
  query CurrentUserNotifications($after: String) {
    currentUser {
      notifications(after: $after) {
        nodes {
          __typename
          ... on EtherRetrieveNotification {
            createdAt
            amount
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
`

// Marketplace

export function useMarketplaceFilters() {
  return useAppSelector((state) => state.search.marketplaceFilters)
}

export function useCardsFilters() {
  return useAppSelector((state) => state.search.cardsFilters)
}

export function useMarketplaceFiltersHandlers(): {
  toggleScarcityFilter: (scarcity: number) => void
  toggleSeasonFilter: (season: number) => void
  toggleLowSerialsFilter: () => void
} {
  const dispatch = useAppDispatch()

  const toggleScarcityFilter = useCallback(
    (scarcity: number) => {
      dispatch(updateMarketplaceScarcityFilter({ scarcity }))
    },
    [dispatch]
  )

  const toggleSeasonFilter = useCallback(
    (season: number) => {
      dispatch(updateMarketplaceSeasonsFilter({ season }))
    },
    [dispatch]
  )

  const toggleLowSerialsFilter = useCallback(() => {
    dispatch(updateMarketplaceLowSerialsFilter())
  }, [dispatch])

  return {
    toggleScarcityFilter,
    toggleSeasonFilter,
    toggleLowSerialsFilter,
  }
}

export function useCardsFiltersHandlers(): {
  toggleScarcityFilter: (scarcity: number) => void
  toggleSeasonFilter: (season: number) => void
} {
  const dispatch = useAppDispatch()

  const toggleScarcityFilter = useCallback(
    (scarcity: number) => {
      dispatch(updateCardsScarcityFilter({ scarcity }))
    },
    [dispatch]
  )

  const toggleSeasonFilter = useCallback(
    (season: number) => {
      dispatch(updateCardsSeasonsFilter({ season }))
    },
    [dispatch]
  )

  return { toggleScarcityFilter, toggleSeasonFilter }
}

interface ApolloSearch {
  nextPage?: () => void
  data: any[]
  loading: boolean
  error: any
}

export function useCurrentUserNotifications(): ApolloSearch {
  // pagination cursor and page
  const [endCursor, setEndCursor] = useState<string | null>(null)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])

  // on query completed
  const onQueryCompleted = useCallback(
    (data: any) => {
      setEndCursor(data?.currentUser?.notifications?.pageInfo?.endCursor ?? null)
      setHasNextPage(data?.currentUser?.notifications?.pageInfo?.hasNextPage ?? false)

      setNotifications(notifications.concat(data?.currentUser?.notifications?.nodes ?? []))
    },
    [notifications.length]
  )

  // get callable query
  const [getAllCurrentUserNotifications, { loading, error }] = useLazyQuery(ALL_CURRENT_USER_NOTIFICATIONS_QUERY, {
    onCompleted: onQueryCompleted,
  })

  // nextPage
  const nextPage = useCallback(() => {
    const options: any = { variables: { after: endCursor } }

    getAllCurrentUserNotifications(options)
  }, [getAllCurrentUserNotifications, endCursor])

  useEffect(() => {
    nextPage()
  }, [])

  return {
    nextPage: hasNextPage ? nextPage : undefined,
    data: notifications,
    loading,
    error,
  }
}
