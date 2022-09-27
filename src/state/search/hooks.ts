import { useCallback, useMemo, useState, useEffect } from 'react'
import { useQuery, gql } from '@apollo/client'
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
  transfersPriceDesc: client.initIndex('transfers-price-desc'),
  transfersDateDesc: client.initIndex('transfers-date-desc'),
  cardsDateDesc: client.initIndex('cards-date-desc'),
  cardsDateAsc: client.initIndex('cards-date-asc'),
  offersPriceDesc: client.initIndex('offers-price-desc'),
  offersPriceAsc: client.initIndex('offers-price-asc'),
  users: client.initIndex('users'),
}

export const TransfersSort = {
  dateDesc: {
    index: algoliaIndexes.transfersDateDesc,
    displayName: 'Last sales',
  },
  priceDesc: {
    index: algoliaIndexes.transfersPriceDesc,
    displayName: 'Highest sales',
  },
}

interface Search {
  hits?: any[]
  nbHits?: number
  loading: boolean
  error: string | null
}

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

interface SearchTransfersFacets {
  cardModelId?: string
  serialNumber?: number
}

interface SearchTransfersProps {
  facets: SearchTransfersFacets
  sortKey?: keyof typeof TransfersSort
}

export function useSearchTransfers({
  facets,
  sortKey = Object.keys(TransfersSort)[0] as keyof typeof TransfersSort,
}: SearchTransfersProps): Search {
  const [transfersSearch, setTransfersSearch] = useState<Search>({ loading: true, error: null })

  const facetFilters = useFacetFilters({ ...facets, is_sale: 'true' })

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

interface SearchCardsFacets {
  ownerUserId?: string
  cardId?: string | string[]
}

interface SearchCardsProps {
  facets: SearchCardsFacets
  dateDesc?: boolean
  search?: string
  skip?: boolean
}

export function useSearchCards({ facets, dateDesc = true, search = '', skip = false }: SearchCardsProps): Search {
  const [cardsSearch, setCardsSearch] = useState<Search>({ loading: true, error: null })

  const facetFilters = useFacetFilters(facets)

  useEffect(() => {
    if (skip) return

    // prettier-ignore
    setCardsSearch({ ...cardsSearch, loading: true, error: null });

    // prettier-ignore
    (dateDesc ? algoliaIndexes.cardsDateDesc : algoliaIndexes.cardsDateAsc)
      .search(search, { facetFilters, page: 0, hitsPerPage: 128 })
      .then((res) => setCardsSearch({ hits: res.hits, loading: false, error: null }))
      .catch((err) => {
        setCardsSearch({ loading: false, error: err })
        console.error(err)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facetFilters, setCardsSearch, dateDesc, search, skip])

  return cardsSearch
}

interface SearchOffersFacets {
  cardModelId?: string
  cardId?: string
  objectID?: string[]
}

interface SearchOffersProps {
  facets: SearchOffersFacets
  priceDesc?: boolean
  skip?: boolean
  hitsPerPage?: number
}

export function useSearchOffers({
  facets,
  priceDesc = true,
  skip = false,
  hitsPerPage = 32,
}: SearchOffersProps): Search {
  const [offersSearch, setOffersSearch] = useState<Search>({ loading: true, error: null })

  const facetFilters = useFacetFilters({ ...facets, available: '-false' })

  useEffect(() => {
    if (skip) return

    // prettier-ignore
    setOffersSearch({ ...offersSearch, loading: true, error: null });

    // prettier-ignore
    (priceDesc ? algoliaIndexes.offersPriceDesc : algoliaIndexes.offersPriceAsc)
      .search('', { facetFilters, page: 0, hitsPerPage })
      .then((res) => setOffersSearch({ ...res, loading: false, error: null }))
      .catch((err) => {
        setOffersSearch({ loading: false, error: err })
        console.error(err)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facetFilters, setOffersSearch, priceDesc, skip, hitsPerPage])

  return offersSearch
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

export function useSearchedUsers() {
  const { data: queryData, loading, error } = useQuery(SEARCHED_USERS_QUERY)
  const searchedUsers = [...(queryData?.currentUser?.searchedUsers ?? [])] // mandatory for reverse() to work

  const orderedSearchedUsers = useMemo(() => searchedUsers.reverse(), [searchedUsers])

  return { searchedUsers: orderedSearchedUsers, loading, error }
}
