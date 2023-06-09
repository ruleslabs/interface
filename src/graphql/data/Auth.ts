import gql from 'graphql-tag'

import {
  usePrepareSignUpMutation,
  useRemoveTwoFactorAuthSecretMutation,
  useRequestPasswordUpdateMutation,
  useRequestTwoFactorAuthSecretRemovalMutation,
  useRevokeSessionMutation,
  useSetTwoFactorAuthSecretMutation,
  useSignInMutation,
  useSignUpMutation,
  useTwoFactorAuthSignInMutation,
  useUpdatePasswordMutation,
} from './__generated__/types-and-hooks'
import { formatApolloError, formatMutationFunction } from './utils'
import { useMemo } from 'react'

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
  mutation SignUp(
    $email: String!
    $username: String!
    $password: String!
    $walletPublicKey: String!
    $walletAddress: String!
    $rulesPrivateKey: RulesPrivateKeyAttributes!
    $emailVerificationCode: String!
    $acceptCommercialEmails: Boolean!
  ) {
    signUp(
      input: {
        email: $email
        username: $username
        password: $password
        walletPublicKey: $walletPublicKey
        walletAddress: $walletAddress
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
    $walletPublicKey: String!
    $rulesPrivateKey: RulesPrivateKeyAttributes!
    $token: String!
  ) {
    updatePassword(
      input: {
        email: $email
        newPassword: $newPassword
        walletPublicKey: $walletPublicKey
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

// HOOKS

export function useRemoveTwoFactorAuthSecret() {
  const [mutation, { loading, error }] = useRemoveTwoFactorAuthSecretMutation()

  return useMemo(
    () =>
      [
        formatMutationFunction(mutation, (data) => ({ accessToken: data.removeTwoFactorAuthSecret?.accessToken })),
        {
          loading,
          error: formatApolloError(error),
        },
      ] as const,
    [mutation, loading, error]
  )
}

export function useSignUp() {
  const [mutation, { loading, error }] = useSignUpMutation()

  return useMemo(
    () =>
      [
        formatMutationFunction(mutation, (data) => ({ accessToken: data.signUp?.accessToken })),
        {
          loading,
          error: formatApolloError(error),
        },
      ] as const,
    [mutation, loading, error]
  )
}

export function usePrepareSignUp() {
  const [mutation, { loading, error }] = usePrepareSignUpMutation()

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

export function useRequestPasswordUpdate() {
  const [mutation, { loading, error }] = useRequestPasswordUpdateMutation()

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

export function useRequestTwoFactorAuthSecretRemoval() {
  const [mutation, { loading, error }] = useRequestTwoFactorAuthSecretRemovalMutation()

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

export function useSignIn() {
  const [mutation, { loading, error }] = useSignInMutation()

  return useMemo(
    () =>
      [
        formatMutationFunction(mutation, (data) => ({
          accessToken: data.signIn?.accessToken,
          twoFactorAuthToken: data.signIn?.twoFactorAuthToken,
        })),
        {
          loading,
          error: formatApolloError(error),
        },
      ] as const,
    [mutation, loading, error]
  )
}

export function useTwoFactorAuthSignIn() {
  const [mutation, { loading, error }] = useTwoFactorAuthSignInMutation()

  return useMemo(
    () =>
      [
        formatMutationFunction(mutation, (data) => ({ accessToken: data.twoFactorAuthSignIn?.accessToken })),
        {
          loading,
          error: formatApolloError(error),
        },
      ] as const,
    [mutation, loading, error]
  )
}

export function useUpdatePassword() {
  const [mutation, { loading, error }] = useUpdatePasswordMutation()

  return useMemo(
    () =>
      [
        formatMutationFunction(mutation, (data) => ({ accessToken: data.updatePassword?.accessToken })),
        {
          loading,
          error: formatApolloError(error),
        },
      ] as const,
    [mutation, loading, error]
  )
}

export function useSetTwoFactorAuthSecret() {
  const [mutation, { loading, error }] = useSetTwoFactorAuthSecretMutation()

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

export function useRevokeSession() {
  const [mutation, { loading, error }] = useRevokeSessionMutation()

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
