import { useCallback, useState, useEffect } from 'react'
import { useLazyQuery, gql } from '@apollo/client'

import { useAppSelector, useAppDispatch } from 'src/state/hooks'
import {
  updateMarketplaceScarcityFilter,
  updateMarketplaceSeasonsFilter,
  updateMarketplaceLowSerialsFilter,
  updateCardsScarcityFilter,
  updateCardsSeasonsFilter,
} from './actions'

export const ASSETS_PAGE_SIZE = 25

const ALL_STARKNET_TRANSACTION_FOR_USER_QUERY = gql`
  query ($address: String, $userId: String!, $after: String) {
    allStarknetTransactionsForAddressOrUserId(address: $address, userId: $userId, after: $after) {
      nodes {
        hash
        status
        fromAddress
        blockNumber
        blockTimestamp
        actualFee
        code
        events {
          key
          data
        }
        l2ToL1Messages {
          fromAddress
          toAddress
          payload
        }
        offchainData {
          action
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`

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

export interface PageFetchedCallbackData {
  pageNumber: number
  totalHitsCount: number
}

export type PageFetchedCallback = (hits: any[], data: PageFetchedCallbackData) => void

interface ApolloSearch {
  nextPage?: () => void
  data: any[]
  loading: boolean
  error: any
}

export function useStarknetTransactionsForAddress(userId?: string, address?: string): ApolloSearch {
  // pagination cursor and page
  const [endCursor, setEndCursor] = useState<string | null>(null)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [starknetTransactions, setStarknetTransactions] = useState<any[]>([])

  // on query completed
  const onQueryCompleted = useCallback(
    (data: any) => {
      if (!data) return

      setEndCursor(data.allStarknetTransactionsForAddressOrUserId.pageInfo.endCursor)
      setHasNextPage(data.allStarknetTransactionsForAddressOrUserId.pageInfo.hasNextPage)

      setStarknetTransactions(starknetTransactions.concat(data.allStarknetTransactionsForAddressOrUserId.nodes))
    },
    [starknetTransactions.length]
  )

  // get callable query
  const [getAllStarknetTransactionsForAddressOrUserId, { loading, error }] = useLazyQuery(
    ALL_STARKNET_TRANSACTION_FOR_USER_QUERY,
    { onCompleted: onQueryCompleted }
  )

  // nextPage
  const nextPage = useCallback(() => {
    const options: any = { variables: { userId, after: endCursor } }

    if (address) options.variables.address = address

    getAllStarknetTransactionsForAddressOrUserId(options)
  }, [getAllStarknetTransactionsForAddressOrUserId, address, endCursor])

  useEffect(() => {
    if (userId) nextPage()
  }, [userId])

  return {
    nextPage: hasNextPage ? nextPage : undefined,
    data: starknetTransactions,
    loading,
    error,
  }
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
