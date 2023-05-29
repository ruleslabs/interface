import { useCallback, useMemo, useState, useEffect } from 'react'
import { useLazyQuery, gql } from '@apollo/client'
import algoliasearch from 'algoliasearch'
import { Unit } from '@rulesorg/sdk-core'

import { NULL_PRICE } from 'src/constants/misc'
import { useAppSelector, useAppDispatch } from 'src/state/hooks'
import {
  updateMarketplaceScarcityFilter,
  updateMarketplaceSeasonsFilter,
  updateMarketplaceLowSerialsFilter,
  updateMarketplaceMaximumPrice,
} from './actions'
import { useEurAmountToWeiAmount } from 'src/hooks/useFiatPrice'

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
  return useAppSelector((state) => state.search.filters)
}

export function useMarketplaceFiltersHandlers(): {
  toggleScarcityFilter: (scarcity: number) => void
  toggleSeasonFilter: (season: number) => void
  toggleLowSerialsFilter: () => void
  setMaximumPrice: (price: number) => void
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

  const setMaximumPrice = useCallback(
    (price: number) => {
      dispatch(updateMarketplaceMaximumPrice({ price }))
    },
    [dispatch]
  )

  return {
    toggleScarcityFilter,
    toggleSeasonFilter,
    toggleLowSerialsFilter,
    setMaximumPrice,
  }
}

export function useAlgoliaFormatedMarketplaceFilters() {
  const filters = useMarketplaceFilters()

  // maximum price in gwei
  const eurAmountToWeiAmount = useEurAmountToWeiAmount()
  const gweiMaximumPrice = useMemo(
    () => +(eurAmountToWeiAmount(filters.maximumPrice ?? undefined)?.toUnitFixed(Unit.GWEI, 0) ?? 0),
    [filters.maximumPrice, eurAmountToWeiAmount]
  )

  return useMemo(
    () => ({
      facets: {
        scarcity: filters.scarcities.map((scarcity) => `-${scarcity}`),
        season: filters.seasons.map((season) => `-${season}`),
        lowestAsk: filters.lowSerials ? undefined : '-0',
        lowSerialLowestAsk: filters.lowSerials ? '-0' : undefined,
      },
      filters: `${filters.lowSerials ? 'gweiLowSerialLowestAsk' : 'gweiLowestAsk'} <= ${gweiMaximumPrice}`,
      skip: !gweiMaximumPrice,
    }),
    [JSON.stringify(filters.scarcities), JSON.stringify(filters.seasons), filters.lowSerials, gweiMaximumPrice]
  )
}

// algolia

const client = algoliasearch(process.env.REACT_APP_ALGOLIA_ID ?? '', process.env.REACT_APP_ALGOLIA_KEY ?? '')
const algoliaIndexes = {
  transfers: {
    priceDesc: client.initIndex('transfers-price-desc'),
    txIndexDesc: client.initIndex('transfers-tx-index-desc'),
  },
  cards: {
    txIndexDesc: client.initIndex('cards-tx-index-desc'),
    txIndexAsc: client.initIndex('cards-tx-index-asc'),
    serialDesc: client.initIndex('cards-serial-desc'),
    serialAsc: client.initIndex('cards-serial-asc'),
    lastPriceDesc: client.initIndex('cards-last-price-desc'),
    lastPriceAsc: client.initIndex('cards-last-price-asc'),
    artistDesc: client.initIndex('cards-artist-desc'),
    artistAsc: client.initIndex('cards-artist-asc'),
  },
  cardModels: {
    lowestAskDesc: client.initIndex('card-models-lowest-ask-desc'),
    lowestAskAsc: client.initIndex('card-models-lowest-ask-asc'),
    lowSerialLowestAskDesc: client.initIndex('card-models-low-serial-lowest-ask-desc'),
    lowSerialLowestAskAsc: client.initIndex('card-models-low-serial-lowest-ask-asc'),
  },
  offers: {
    priceDesc: client.initIndex('offers-price-desc'),
    priceAsc: client.initIndex('offers-price-asc'),
    serialDesc: client.initIndex('offers-serial-desc'),
    serialAsc: client.initIndex('offers-serial-asc'),
    txIndexDesc: client.initIndex('offers-tx-index-desc'),
  },
  users: {
    certified: client.initIndex('users'),
    cScore: client.initIndex('users-c-score-desc'),
  },
}

export interface PageFetchedCallbackData {
  pageNumber: number
  totalHitsCount: number
}

export type PageFetchedCallback = (hits: any[], data: PageFetchedCallbackData) => void

export type TransfersSortingKey = keyof typeof algoliaIndexes.transfers
export type CardsSortingKey = keyof typeof algoliaIndexes.cards
export type CardModelsSortingKey = keyof typeof algoliaIndexes.cardModels
export type OffersSortingKey = keyof typeof algoliaIndexes.offers
export type UsersSortingKey = keyof typeof algoliaIndexes.users

interface AlgoliaSearch {
  nextPage?: () => void
  hits?: any[]
  nbHits?: number
  loading: boolean
  error: string | null
}

interface ApolloSearch {
  nextPage?: () => void
  data: any[]
  loading: boolean
  error: any
}

function useFacetFilters(facets: any) {
  return useMemo(
    () =>
      Object.keys(facets).reduce<(string | string[])[]>((acc, facetKey) => {
        const facet = facets[facetKey]

        if (!facet) {
          return acc
        } else if (Array.isArray(facet)) {
          const arr: string[] = []

          // push dashed facets in the root array and the rest in a child array
          for (const value of facet) {
            ;(value.indexOf('-') === 0 ? acc : arr).push(`${facetKey}:${value}`)
          }

          if (arr.length) acc.push(arr)
        } else {
          acc.push(`${facetKey}:${facet}`)
        }

        return acc
      }, []),
    [JSON.stringify(facets)]
  )
}

// ALGOLIA SEARCHES

const ALGOLIA_FIRST_PAGE = 0

interface AlgoliaSearchProps {
  search?: string
  facets: any
  filters?: string
  algoliaIndex: any
  hitsPerPage: number
  onPageFetched?: PageFetchedCallback
  skip: boolean
  pageNumber?: number
}

function useAlgoliaSearch({
  search = '',
  facets = {},
  filters,
  algoliaIndex,
  hitsPerPage,
  onPageFetched,
  skip,
  pageNumber = ALGOLIA_FIRST_PAGE,
}: AlgoliaSearchProps): AlgoliaSearch {
  const [searchResult, setSearchResult] = useState<AlgoliaSearch>({ loading: false, error: null })
  const [pageOffset, setPageOffset] = useState<number | null>(0)

  const facetFilters = useFacetFilters({ ...facets })

  // search callback
  const runSearch = useCallback(
    (pageNumber: number) => {
      setSearchResult((searchResult) => ({ ...searchResult, loading: true, error: null }))

      algoliaIndex
        .search(search, { facetFilters, filters, page: pageNumber, hitsPerPage })
        .then((res: any) => {
          setSearchResult((searchResult) => ({
            hits: onPageFetched ? [] : (searchResult.hits ?? []).concat(res.hits),
            nbHits: res.nbHits,
            loading: false,
            error: null,
          }))

          // increase page offset if possible
          setPageOffset((pageOffset) => (res.page + 1 < res.nbPages ? (pageOffset ?? 0) + 1 : null))

          if (onPageFetched) onPageFetched(res.hits, { pageNumber: res.page, totalHitsCount: res.nbHits })
        })
        .catch((err: string) => {
          setSearchResult({ loading: false, error: err })
          console.error(err)
        })
    },
    [algoliaIndex, facetFilters, hitsPerPage, filters, search, onPageFetched]
  )

  // next page callback
  const nextPage = useCallback(() => {
    if (pageOffset !== null) runSearch(pageNumber + pageOffset)
  }, [runSearch, pageNumber, pageOffset])

  // refresh
  useEffect(() => {
    if (!skip) {
      setPageOffset(0)
      runSearch(pageNumber)
    }
  }, [skip, runSearch])

  return {
    nextPage: pageOffset === null ? undefined : nextPage,
    ...searchResult,
  }
}

// TRANSFERS

interface SearchTransfersProps {
  facets?: {
    cardModelId?: string
    serialNumber?: number
    fromStarknetAddress?: string
    price?: string
  }
  hitsPerPage?: number
  sortingKey?: TransfersSortingKey
  onlySales?: boolean
  skip?: boolean
  onPageFetched?: PageFetchedCallback
  noMinting?: boolean
}

export function useSearchTransfers({
  facets = {},
  sortingKey = Object.keys(algoliaIndexes.transfers)[0] as TransfersSortingKey,
  onlySales = false,
  noMinting = false,
  hitsPerPage = 32,
  onPageFetched,
  skip = false,
}: SearchTransfersProps): AlgoliaSearch {
  return useAlgoliaSearch({
    facets: {
      ...facets,
      price: onlySales ? `-${NULL_PRICE}` : facets.price,
      fromStarknetAddress: noMinting ? '-0x0' : facets.fromStarknetAddress,
    },
    algoliaIndex: algoliaIndexes.transfers[sortingKey],
    hitsPerPage,
    onPageFetched,
    skip,
  })
}

// CARDS

interface SearchCardsProps {
  facets?: {
    ownerStarknetAddress?: string
    cardId?: string | string[]
  }
  sortingKey?: CardsSortingKey
  search?: string
  skip?: boolean
  hitsPerPage?: number
  onPageFetched?: PageFetchedCallback
}

export function useSearchCards({
  search = '',
  facets = {},
  sortingKey = Object.keys(algoliaIndexes.cards)[0] as CardsSortingKey,
  hitsPerPage = 32,
  onPageFetched,
  skip = false,
}: SearchCardsProps): AlgoliaSearch {
  return useAlgoliaSearch({
    facets: {
      ...facets,
      cardId: undefined,
      objectID: facets.cardId,
    },
    algoliaIndex: algoliaIndexes.cards[sortingKey],
    hitsPerPage,
    onPageFetched,
    skip,
    search,
  })
}

// CARD MODELS

interface SearchCardModelsProps {
  facets?: {
    season?: string[]
    scarcity?: string[]
    lowestAsk?: string
    lowSerialLowestAsk?: string
    cardModelId?: string | string[]
  }
  filters?: string
  sortingKey?: CardModelsSortingKey
  search?: string
  skip?: boolean
  hitsPerPage?: number
  onPageFetched?: PageFetchedCallback
}

export function useSearchCardModels({
  search = '',
  facets = {},
  filters,
  sortingKey = Object.keys(algoliaIndexes.cardModels)[0] as CardModelsSortingKey,
  hitsPerPage = 32,
  onPageFetched,
  skip = false,
}: SearchCardModelsProps): AlgoliaSearch {
  return useAlgoliaSearch({
    facets: {
      ...facets,
      cardModelId: undefined,
      objectID: facets.cardModelId,
    },
    filters,
    algoliaIndex: algoliaIndexes.cardModels[sortingKey],
    hitsPerPage,
    onPageFetched,
    skip,
    search,
  })
}

// OFFERS

interface SearchOffersProps {
  facets?: {
    cardModelId?: string
    cardId?: string
    objectID?: string[]
  }
  priceDesc?: boolean
  skip?: boolean
  hitsPerPage?: number
  onPageFetched?: PageFetchedCallback
  sortingKey?: OffersSortingKey
}

export function useSearchOffers({
  facets = {},
  sortingKey = Object.keys(algoliaIndexes.offers)[0] as OffersSortingKey,
  skip = false,
  hitsPerPage = 32,
  onPageFetched,
}: SearchOffersProps): AlgoliaSearch {
  return useAlgoliaSearch({
    facets: {
      ...facets,
      available: '-false',
    },
    algoliaIndex: algoliaIndexes.offers[sortingKey],
    hitsPerPage,
    onPageFetched,
    skip,
  })
}

// USERS

interface SearchUsersProps {
  search?: string
  hitsPerPage?: number
  sortingKey?: UsersSortingKey
  onPageFetched?: PageFetchedCallback
  skip?: boolean
  filters?: string
  pageNumber?: number
  facets?: {
    username?: string
    userId?: string
  }
}

export function useSearchUsers({
  search = '',
  facets = {},
  filters,
  sortingKey = Object.keys(algoliaIndexes.users)[0] as UsersSortingKey,
  hitsPerPage = 10,
  skip = false,
  onPageFetched,
  pageNumber,
}: SearchUsersProps) {
  return useAlgoliaSearch({
    facets: { ...facets, userId: undefined, objectID: facets.userId },
    filters,
    search,
    algoliaIndex: algoliaIndexes.users[sortingKey],
    hitsPerPage,
    onPageFetched,
    skip,
    pageNumber,
  })
}

// Non algolia search

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
