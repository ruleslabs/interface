import { gql } from '@apollo/client'
import { apolloClient } from '@/graphql/data/apollo'

const REFRESH_TOKEN = gql`
  mutation RefreshToken {
    refreshToken
  }
`

export default async function refreshToken() {
  return apolloClient.mutate({ mutation: REFRESH_TOKEN })
}
