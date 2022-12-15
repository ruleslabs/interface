import { useCallback, useMemo, useState, useEffect } from 'react'
import { useQuery, useLazyQuery, gql } from '@apollo/client'
import algoliasearch from 'algoliasearch'

import { useAppSelector, useAppDispatch } from '@/state/hooks'
import {
  updateMarketplaceScarcityFilter,
  updateMarketplaceSeasonsFilter,
  updateMarketplaceMaximumPrice,
} from './actions'

const SEARCHED_USERS_QUERY = gql`
  query {
    currentUser {
      searchedUsers {
        slug
        username
        profile {
          pictureUrl
          certified
        }
      }
    }
  }
`

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

// Marketplace

export function useMarketplaceFilters() {
  return useAppSelector((state) => state.search.filters)
}

export function useMarketplaceScarcityFilterToggler(): (scarcity: string) => void {
  const dispatch = useAppDispatch()

  const toggleTierFilter = useCallback(
    (scarcity: string) => {
      dispatch(updateMarketplaceScarcityFilter({ scarcity }))
    },
    [dispatch]
  )

  return toggleTierFilter
}

export function useMarketplaceSeasonsFilterToggler(): (season: number) => void {
  const dispatch = useAppDispatch()

  const toggleSeasonFilter = useCallback(
    (season: number) => {
      dispatch(updateMarketplaceSeasonsFilter({ season }))
    },
    [dispatch]
  )

  return toggleSeasonFilter
}

export function useMarketplaceSetMaximumPrice(): (price: number) => void {
  const dispatch = useAppDispatch()

  const setMaximumPrice = useCallback(
    (price: number) => {
      dispatch(updateMarketplaceMaximumPrice({ price }))
    },
    [dispatch]
  )

  return setMaximumPrice
}

// algolia

const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_ID ?? '', process.env.NEXT_PUBLIC_ALGOLIA_KEY ?? '')
const algoliaIndexes = {
  transfers: {
    priceDesc: client.initIndex('transfers-price-desc'),
    dateDesc: client.initIndex('transfers-date-desc'),
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
  offers: {
    priceDesc: client.initIndex('offers-price-desc'),
    priceAsc: client.initIndex('offers-price-asc'),
    txIndexDesc: client.initIndex('offers-tx-index-desc'),
  },
  users: client.initIndex('users'),
}

export type CardsSortingKey = keyof typeof algoliaIndexes.cards
export type OffersSortingKey = keyof typeof algoliaIndexes.offers

export const TransfersSort = {
  dateDesc: {
    index: algoliaIndexes.transfers.dateDesc,
    displayName: 'Last sales',
  },
  priceDesc: {
    index: algoliaIndexes.transfers.priceDesc,
    displayName: 'Highest sales',
  },
}

interface AlgoliaSearch {
  nextPage?: () => void
  hits?: any[]
  nbHits?: number
  loading: boolean
  error: string | null
}

type ApolloSearch = [(() => void) | null, { data: any[]; loading: boolean; error: any }]

function useFacetFilters(facets: any) {
  return useMemo(
    () =>
      Object.keys(facets).reduce<string[]>((acc, facetKey) => {
        const facet = facets[facetKey]

        if (!facet) {
          return acc
        } else if (Array.isArray(facet)) {
          for (const value of facet) acc.push(`${facetKey}:${value}`)
        } else {
          acc.push(`${facetKey}:${facet}`)
        }

        return acc
      }, []),
    [JSON.stringify(facets)]
  )
}

// ALGOLIA SEARCHES

interface SearchTransfersFacets {
  cardModelId?: string
  serialNumber?: number
}

interface SearchTransfersProps {
  facets: SearchTransfersFacets
  sortKey?: keyof typeof TransfersSort
  onlySales?: boolean
}

export function useSearchTransfers({
  facets,
  sortKey = Object.keys(TransfersSort)[0] as keyof typeof TransfersSort,
  onlySales = false,
}: SearchTransfersProps): Search {
  const [transfersSearch, setTransfersSearch] = useState<Search>({ loading: true, error: null })

  const facetFilters = useFacetFilters({ ...facets, is_sale: onlySales ? 'true' : undefined })

  useEffect(() => {
    setTransfersSearch({ ...transfersSearch, loading: true, error: null })

    TransfersSort[sortKey].index
      .search('', { facetFilters, page: 0, hitsPerPage: 32 })
      .then((res) => setTransfersSearch({ hits: res.hits, loading: false, error: null }))
      .catch((err) => {
        setTransfersSearch({ loading: false, error: err })
        console.error(err)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facetFilters, setTransfersSearch, sortKey])

  return transfersSearch
}

interface SearchCardsProps {
  facets: {
    ownerStarknetAddress?: string
    cardId?: string | string[]
  }
  sortingKey?: CardsSortingKey
  search?: string
  skip?: boolean
}

export function useSearchCards({
  facets,
  sortingKey = Object.keys(algoliaIndexes.cards)[0] as CardsSortingKey,
  search = '',
  skip = false,
}: SearchCardsProps): Search {
  const [cardsSearch, setCardsSearch] = useState<Search>({ loading: true, error: null })

  const facetFilters = useFacetFilters(facets)

  useEffect(() => {
    if (skip) {
      setCardsSearch({ loading: false, error: null })
      return
    }

    // prettier-ignore
    setCardsSearch({ ...cardsSearch, loading: true, error: null });

    // prettier-ignore
    algoliaIndexes.cards[sortingKey]
      .search(search, { facetFilters, page: 0, hitsPerPage: 256 }) // TODO pagination bruh
      .then((res) => setCardsSearch({ hits: res.hits, loading: false, error: null }))
      .catch((err) => {
        setCardsSearch({ loading: false, error: err })
        console.error(err)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facetFilters, setCardsSearch, sortingKey, search, skip])

  return cardsSearch
}

interface SearchOffersProps {
  facets: {
    cardModelId?: string
    cardId?: string
    objectID?: string[]
  }
  priceDesc?: boolean
  skip?: boolean
  hitsPerPage?: number
  onPageFetch?: (hits: any[]) => void
}

export function useSearchOffers({
  facets = {},
  sortingKey = Object.keys(algoliaIndexes.offers)[0] as OffersSortingKey,
  skip = false,
  hitsPerPage = 32,
  onPageFetch,
}: SearchOffersProps): AlgoliaSearch {
  const [offersSearch, setOffersSearch] = useState<AlgoliaSearch>({ loading: true, error: null })
  const [nextPageNumber, setNextPageNumber] = useState<number | null>(0)

  const facetFilters = useFacetFilters({ ...facets, available: '-false' })

  const getOffers = useCallback(() => {
    if (nextPageNumber === null) return

    algoliaIndexes.offers[sortingKey]
      .search('', { facetFilters, page: nextPageNumber, hitsPerPage })
      .then((res) => {
        setOffersSearch({
          hits: (offersSearch.hits ?? []).concat(res.hits),
          nbHits: res.nbHits,
          loading: false,
          error: null,
        })
        setNextPageNumber(res.page + 1 < res.nbPages ? res.page + 1 : null)
        if (onPageFetch) onPageFetch(res.hits)
      })
      .catch((err) => {
        setOffersSearch({ loading: false, error: err })
        console.error(err)
      })
  }, [nextPageNumber, facetFilters, hitsPerPage, offersSearch.hits])

  useEffect(() => {
    if (nextPageNumber === 0 && !skip) getOffers()
  }, [skip, nextPageNumber])

  return {
    nextPage: nextPageNumber === null ? null : getOffers,
    ...offersSearch,
  }
}

interface SearchUsersFacets {
  username?: string
}

interface SearchUsersProps {
  search?: string
  facets: SearchUsersFacets
}

export function useSearchUsers({ search = '', facets }: SearchUsersProps) {
  const [usersSearch, setUsersSearch] = useState<Search>({ loading: true, error: null })

  const facetFilters = useFacetFilters(facets)

  useEffect(() => {
    algoliaIndexes.users
      .search(search, { facetFilters, page: 0, hitsPerPage: 10 })
      .then((res) => setUsersSearch({ hits: res.hits, loading: false, error: null }))
      .catch((err) => {
        setUsersSearch({ loading: false, error: err })
        console.error(err)
      })
  }, [facetFilters, search, setUsersSearch])

  return usersSearch
}

// Non algolia search

export function useSearchedUsers() {
  const { data: queryData, loading, error } = useQuery(SEARCHED_USERS_QUERY)
  const searchedUsers = [...(queryData?.currentUser?.searchedUsers ?? [])] // mandatory for reverse() to work

  const orderedSearchedUsers = useMemo(() => searchedUsers.reverse(), [searchedUsers])

  return { searchedUsers: orderedSearchedUsers, loading, error }
}

export function useStarknetTransactionsForAddress(userId: string, address?: string): ApolloSearch {
  // pagination cursor and page
  const [endCursor, setEndCursor] = useState<string | null>(null)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [starknetTransactions, setStarknetTransactions] = useState<any[]>([])

  // on query completed
  const onQueryCompleted = useCallback(
    (data: any) => {
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
    nextPage()
  }, [])

  return [hasNextPage ? nextPage : null, { data: starknetTransactions, loading, error }]
}
