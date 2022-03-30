import { gql } from '@apollo/client'
import { getApolloClient } from '@/apollo/apollo'

const REFRESH_TOKEN = gql`
  mutation RefreshToken {
    refreshToken
  }
`

export default async function refreshToken() {
  return getApolloClient()?.mutate({ mutation: REFRESH_TOKEN })
}
