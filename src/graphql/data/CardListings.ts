import { useCallback, useMemo } from 'react'
import gql from 'graphql-tag'

import { CardListing } from 'src/types'
import {
  CardListingsFilterInput,
  CardListingsQuery,
  CardListingsSortInput,
  CardModelsQueryVariables,
  useCardListingsQuery,
} from './__generated__/types-and-hooks'
import { ScarcityName } from '@rulesorg/sdk-core'

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
  filter: CardListingsFilterInput
  sort: CardListingsSortInput
  first?: number
  after?: string
}

export const LISTINGS_PAGE_SIZE = 32

const defaultCardListingsFetcherParams: Omit<CardModelsQueryVariables, 'filter' | 'sort'> = {
  first: LISTINGS_PAGE_SIZE,
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

  const assets: CardListing[] | undefined = useMemo(
    () =>
      data?.cardListings?.edges?.map((queryCardListing) => {
        return formatCardListingQueryData(queryCardListing)
      }),
    [data?.cardListings?.edges, data?.cardListings]
  )

  return useMemo(() => {
    return {
      data: assets,
      hasNext,
      loading,
      loadMore,
    }
  }, [assets, hasNext, loadMore, loading])
}
