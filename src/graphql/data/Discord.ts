import gql from 'graphql-tag'
import { useMemo } from 'react'

import {
  useConnectDiscordAccountMutation,
  useDisconnectDiscordAccountMutation,
  useRefreshDiscordRolesMutation,
  useSetDiscordAccountVisibilityMutation,
} from './__generated__/types-and-hooks'
import { formatApolloError, formatMutationFunction } from './utils'

gql`
  mutation ConnectDiscordAccount($code: String!, $redirectPath: String!) {
    connectDiscordAccount(input: { code: $code, redirectPath: $redirectPath }) {
      id
      username
      discriminator
    }
  }
`

gql`
  mutation DisconnectDiscordAccount {
    disconnectDiscordAccount {
      discordId
    }
  }
`

gql`
  mutation RefreshDiscordRoles {
    refreshDiscordRoles
  }
`

gql`
  mutation SetDiscordAccountVisibility($visible: Boolean!) {
    setDiscordAccountVisibility(visible: $visible) {
      visible
    }
  }
`

// HOOKS

export function useConnectDiscordAccount() {
  const [mutation, { loading, error }] = useConnectDiscordAccountMutation()

  return useMemo(
    () =>
      [
        formatMutationFunction(mutation, (data) => data.connectDiscordAccount),
        {
          loading,
          error: formatApolloError(error),
        },
      ] as const,
    [mutation, loading, error]
  )
}

export function useDisconnectDiscordAccount() {
  const [mutation, { loading, error }] = useDisconnectDiscordAccountMutation()

  return useMemo(
    () =>
      [
        formatMutationFunction(mutation, (data) => ({ discordId: data.disconnectDiscordAccount?.discordId })),
        {
          loading,
          error: formatApolloError(error),
        },
      ] as const,
    [mutation, loading, error]
  )
}

export function useRefreshDiscordRoles() {
  const [mutation, { loading, error }] = useRefreshDiscordRolesMutation()

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

export function useSetDiscordAccountVisibility() {
  const [mutation, { loading, error }] = useSetDiscordAccountVisibilityMutation()

  return useMemo(
    () =>
      [
        formatMutationFunction(mutation, (data) => ({ visible: data.setDiscordAccountVisibility?.visible })),
        {
          loading,
          error: formatApolloError(error),
        },
      ] as const,
    [mutation, loading, error]
  )
}
