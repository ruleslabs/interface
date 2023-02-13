import { useMemo } from 'react'
import { gql, useQuery } from '@apollo/client'
import { TransferSingleEvent } from '@rulesorg/sdk-core'

const USERS_QUERY_CONTENT = `
  usersByStarknetAddresses(starknetAddresses: $usersStarknetAddresses) {
    username
    slug
    starknetWallet {
      address
    }
  }
`

const CARD_AND_USERS_EVENT_QUERY = gql`
  query ($starknetTokenId: String!, $usersStarknetAddresses: [String!]!) {
    cardByStarknetTokenId(starknetTokenId: $starknetTokenId) {
      serialNumber
      cardModel {
        pictureUrl(derivative: "width=128")
        season
        slug
        artist {
          displayName
        }
      }
    }
    ${USERS_QUERY_CONTENT}
  }
`

const PACK_AND_USERS_EVENT_QUERY = gql`
  query ($starknetTokenId: String!, $usersStarknetAddresses: [String!]!) {
    packByStarknetTokenId(starknetTokenId: $starknetTokenId) {
      displayName
      pictureUrl(derivative: "width=128")
      slug
    }
    ${USERS_QUERY_CONTENT}
  }
`

const USERS_EVENT_QUERY = gql`
  query ($usersStarknetAddresses: [String!]!) {
    ${USERS_QUERY_CONTENT}
  }
`

export function useMapUsersByAddress(users?: any) {
  return useMemo(
    () =>
      ((users ?? []) as any[]).reduce<{ [address: string]: any }>((acc, user) => {
        acc[user.starknetWallet.address] = user
        return acc
      }, {}),
    [users?.length]
  )
}

export function useTokenAndAddressesQuery(
  tokenType: TransferSingleEvent['type'],
  tokenId: string,
  addresses: string[]
) {
  // get gql query base on token type
  const gqlQuery = useMemo(() => {
    switch (tokenType) {
      case 'card':
        return CARD_AND_USERS_EVENT_QUERY

      case 'pack':
        return PACK_AND_USERS_EVENT_QUERY
    }
  }, [tokenType])

  // query data
  return useQuery(gqlQuery, {
    variables: { starknetTokenId: tokenId, usersStarknetAddresses: addresses },
    skip: !gqlQuery,
  })
}

export function useAddressesQuery(addresses: string[]) {
  // query data
  return useQuery(USERS_EVENT_QUERY, { variables: { usersStarknetAddresses: addresses } })
}
