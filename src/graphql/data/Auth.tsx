import { useCallback } from 'react'
import gql from 'graphql-tag'
import { ApolloError } from 'apollo-client'

import {
  usePrepareSignUpMutation,
  useRemoveTwoFactorAuthSecretMutation,
  useRequestPasswordUpdateMutation,
  useRequestTwoFactorAuthSecretRemovalMutation,
  useSignInMutation,
  useSignUpMutation,
  useTwoFactorAuthSignInMutation,
  useUpdatePasswordMutation,
} from './__generated__/types-and-hooks'
import { CleanMutationFunction, GenieError } from '@/types'
import { MutationFunction } from '@apollo/client'
import { formatError } from '@/utils/error'

gql`
  mutation RevokeSession($payload: String) {
    revokeRefreshToken(payload: $payload)
  }
`

gql`
  mutation PrepareSignUp($email: String!, $username: String!, $recaptchaTokenV2: String!) {
    prepareSignUp(input: { email: $email, username: $username, recaptchaTokenV2: $recaptchaTokenV2 })
  }
`

gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(input: { email: $email, password: $password }) {
      accessToken
      twoFactorAuthToken
    }
  }
`

gql`
  mutation googleAuth($token: String!) {
    googleAuth(token: $token) {
      accessToken
    }
  }
`

gql`
  mutation SignUp(
    $email: String!
    $username: String!
    $password: String!
    $starknetPub: String!
    $rulesPrivateKey: RulesPrivateKeyAttributes!
    $emailVerificationCode: String!
    $acceptCommercialEmails: Boolean!
  ) {
    signUp(
      input: {
        email: $email
        username: $username
        password: $password
        starknetPub: $starknetPub
        rulesPrivateKey: $rulesPrivateKey
        emailVerificationCode: $emailVerificationCode
        acceptCommercialEmails: $acceptCommercialEmails
      }
    ) {
      accessToken
    }
  }
`

gql`
  mutation RequestPasswordUpdate($email: String!, $recaptchaTokenV2: String!) {
    requestPasswordUpdate(input: { email: $email, recaptchaTokenV2: $recaptchaTokenV2 })
  }
`

gql`
  mutation RequestTwoFactorAuthSecretRemoval($email: String!, $recaptchaTokenV2: String!) {
    requestTwoFactorAuthSecretRemoval(input: { email: $email, recaptchaTokenV2: $recaptchaTokenV2 })
  }
`

gql`
  mutation UpdatePassword(
    $email: String!
    $newPassword: String!
    $starknetPub: String!
    $rulesPrivateKey: RulesPrivateKeyAttributes!
    $token: String!
  ) {
    updatePassword(
      input: {
        email: $email
        newPassword: $newPassword
        starknetPub: $starknetPub
        rulesPrivateKey: $rulesPrivateKey
        token: $token
      }
    ) {
      accessToken
    }
  }
`

gql`
  mutation RemoveTwoFactorAuthSecret($email: String!, $token: String!) {
    removeTwoFactorAuthSecret(input: { email: $email, token: $token }) {
      accessToken
    }
  }
`

gql`
  mutation SetTwoFactorAuthSecret($secret: String!, $code: String!) {
    setTwoFactorAuthSecret(input: { secret: $secret, code: $code })
  }
`

gql`
  mutation TwoFactorAuthSignIn($token: String!, $code: String!) {
    twoFactorAuthSignIn(input: { token: $token, code: $code }) {
      accessToken
    }
  }
`

export function formatApolloError(error?: ApolloError): GenieError {
  const grapqlError = error?.graphQLErrors?.[0]
  if (!grapqlError) return null

  const message = grapqlError.message ?? 'Unkown Error'
  const id = typeof grapqlError.extensions?.id === 'string' ? grapqlError.extensions.id : null

  return formatError(message, id)
}

export function formatMutationFunction<TData, TVariables>(mutationFunction: MutationFunction<TData, TVariables>): CleanMutationFunction<TData, TVariables> {
  return useCallback((options: Parameters<typeof mutationFunction>[0]) => {
    mutationFunction(options)
  }, [mutationFunction])
}

// HOOKS

export function useRemoveTwoFactorAuthSecret() {
  const [mutation, { data, loading, error }] = useRemoveTwoFactorAuthSecretMutation()

  return [formatMutationFunction(mutation), {
    data: data?.removeTwoFactorAuthSecret?.accessToken,
    loading,
    error: formatApolloError(error),
  }] as const
}

export function useSignUp() {
  const [mutation, { data, loading, error }] = useSignUpMutation()

  return [formatMutationFunction(mutation), {
    data: data?.signUp?.accessToken,
    loading,
    error: formatApolloError(error),
  }] as const
}

export function usePrepareSignUp() {
  const [mutation, { data, loading, error }] = usePrepareSignUpMutation()

  data?.prepareSignUp

  return [formatMutationFunction(mutation), {
    data: !!data,
    loading,
    error: formatApolloError(error),
  }] as const
}

export function useRequestPasswordUpdate() {
  const [mutation, { data, loading, error }] = useRequestPasswordUpdateMutation()

  return [formatMutationFunction(mutation), {
    data: !!data,
    loading,
    error: formatApolloError(error),
  }] as const
}

export function useRequestTwoFactorAuthSecretRemoval() {
  const [mutation, { data, loading, error }] = useRequestTwoFactorAuthSecretRemovalMutation()

  return [formatMutationFunction(mutation), {
    data: !!data,
    loading,
    error: formatApolloError(error),
  }] as const
}

export function useSignIn() {
  const [mutation, { data, loading, error }] = useSignInMutation()

  const mutationData = data?.signIn ?? {}

  return [formatMutationFunction(mutation), {
    data: {
      accessToken: mutationData.accessToken,
      twoFactorAuthToken: mutationData.twoFactorAuthToken,
    },
    loading,
    error: formatApolloError(error),
  }] as const
}

export function useTwoFactorAuthSignIn() {
  const [mutation, { data, loading, error }] = useTwoFactorAuthSignInMutation()

  return [formatMutationFunction(mutation), {
    data: data?.twoFactorAuthSignIn?.accessToken,
    loading,
    error: formatApolloError(error),
  }] as const
}

export function useUpdatePassword() {
  const [mutation, { data, loading, error }] = useUpdatePasswordMutation()

  return [formatMutationFunction(mutation), {
    data: data?.updatePassword?.accessToken,
    loading,
    error: formatApolloError(error),
  }] as const
}
