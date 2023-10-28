import { useCallback, useMemo } from 'react'
import gql from 'graphql-tag'
import { ScarcityName } from '@rulesorg/sdk-core'

import { CardListing } from 'src/types'
import {
  CardListingsFilterInput,
  CardListingsQuery,
  CardListingsQueryVariables,
  CardListingsSortInput,
  useCardListingsQuery,
  useListCardsMutation,
  useListingToSweepQuery,
  useMaxListedSerialQuery,
} from './__generated__/types-and-hooks'
import { formatApolloError, formatMutationFunction } from './utils'

gql`
  query CardListings($filter: CardListingsFilterInput!, $sort: CardListingsSortInput!, $after: String, $first: Int) {
    cardListings(filter: $filter, sort: $sort, after: $after, first: $first) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          id
          price
          createdAt
          orderSigningData {
            signature {
              r
              s
            }
            salt
          }
          card {
            serialNumber
            cardModel {
              id
              slug
              pictureUrl(derivative: "width=512")
              season
              scarcity {
                maxSupply
                name
              }
              artistName
            }
          }
          offerer {
            starknetAddress
            user {
              username
              slug
              profile {
                pictureUrl(derivative: "width=128")
                fallbackUrl(derivative: "width=128")
              }
            }
          }
        }
      }
    }
  }
`

gql`
  query ListingToSweep($filter: CardListingsFilterInput!, $first: Int) {
    cardListings(filter: $filter, sort: { direction: ASC, type: PRICE }, first: $first) {
      nodes {
        price
        orderSigningData {
          signature {
            r
            s
          }
          salt
        }
        card {
          serialNumber
          tokenId
          cardModel {
            slug
            pictureUrl(derivative: "width=512")
            season
            scarcity {
              name
            }
            artistName
          }
          voucherSigningData {
            signature {
              r
              s
            }
            salt
          }
        }
        offerer {
          starknetAddress
          user {
            starknetWallet {
              currentPublicKey
              deployed
            }
          }
        }
      }
    }
  }
`

gql`
  query MaxListedSerial {
    cardListings(filter: {}, sort: { direction: DESC, type: SERIAL_NUMBER }, first: 1) {
      nodes {
        card {
          serialNumber
        }
      }
    }
  }
`

gql`
  mutation ListCards($cardListings: [CardListingParametersInput!]!, $fullPublicKey: String!) {
    listCards(input: { cardListings: $cardListings, fullPublicKey: $fullPublicKey }) {
      id
    }
  }
`

// HOOKS

export function useListCards() {
  const [mutation, { loading, error }] = useListCardsMutation()

  return useMemo(
    () =>
      [
        formatMutationFunction(mutation, (data) => ({ success: !!data })),
        {
          loading,
          error: formatApolloError(error),
        },
      ] as const,
    [mutation, loading, error]
  )
}

export function formatCardListingQueryData({
  node: queryCardListing,
}: NonNullable<CardListingsQuery['cardListings']>['edges'][number]): CardListing {
  const card = queryCardListing.card
  const cardModel = card.cardModel
  const offererUser = queryCardListing.offerer.user

  return {
    price: queryCardListing.price,
    orderSigningData: queryCardListing.orderSigningData,
    createdAt: new Date(queryCardListing.createdAt),
    card: {
      serialNumber: card.serialNumber,
    },
    cardModel: {
      slug: cardModel.slug,
      imageUrl: cardModel.pictureUrl,
      season: cardModel.season,
      scarcityMaxSupply: cardModel.scarcity.maxSupply,
      scarcityName: cardModel.scarcity.name as ScarcityName,
      artistName: cardModel.artistName,
    },
    offerer: {
      profile: {
        username: offererUser?.username,
        slug: offererUser?.slug,
        imageUrl: offererUser?.profile.pictureUrl ?? '',
        fallbackUrl: offererUser?.profile.fallbackUrl ?? '',
      },
      starknetAddress: queryCardListing.offerer.starknetAddress,
    },
  }
}

export interface CardListingsFetcherParams {
  filter?: CardListingsFilterInput
  sort: CardListingsSortInput
  first?: number
  after?: string
}

export const LISTINGS_PAGE_SIZE = 32

const defaultCardListingsFetcherParams: Omit<CardListingsQueryVariables, 'sort'> = {
  first: LISTINGS_PAGE_SIZE,
  filter: {},
}

export function useCardListings(params: CardListingsFetcherParams, skip?: boolean) {
  const variables = useMemo(() => ({ ...defaultCardListingsFetcherParams, ...params }), [params])

  const { data, loading, fetchMore } = useCardListingsQuery({ variables, skip })
  const hasNext = data?.cardListings?.pageInfo?.hasNextPage
  const loadMore = useCallback(
    () =>
      fetchMore({
        variables: {
          after: data?.cardListings?.pageInfo?.endCursor,
        },
      }),
    [data?.cardListings?.pageInfo?.endCursor, fetchMore]
  )

  const cardListings: CardListing[] | undefined = useMemo(
    () =>
      data?.cardListings?.edges?.map((queryCardListing) => {
        return formatCardListingQueryData(queryCardListing)
      }),
    [data?.cardListings?.edges, data?.cardListings]
  )

  return useMemo(() => {
    return {
      data: cardListings,
      hasNext,
      loading,
      loadMore,
    }
  }, [cardListings, hasNext, loadMore, loading])
}

// SWEEP

export function useMaxListedSerialNumber(skip?: boolean) {
  const { data, loading } = useMaxListedSerialQuery({ skip, fetchPolicy: 'no-cache' })

  const serialNumber = data?.cardListings?.nodes?.[0].card.serialNumber

  return useMemo(() => {
    return {
      data: serialNumber,
      loading,
    }
  }, [serialNumber, loading])
}

export function useListingsToSweep(maxSerial: number, first: number, skip?: boolean) {
  const variables = useMemo(() => ({ filter: { maxSerial }, first }), [maxSerial, first])

  const { data, loading } = useListingToSweepQuery({ variables, skip, fetchPolicy: 'no-cache' })

  const listings = data?.cardListings?.nodes ?? []

  return useMemo(() => {
    return {
      data: listings,
      loading,
    }
  }, [listings, loading])
}
