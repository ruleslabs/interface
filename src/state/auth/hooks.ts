import { useCallback } from 'react'
import { useMutation, gql } from '@apollo/client'

import { AppState } from '@/state'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  updateEmailField,
  updatePasswordField,
  updateUsernameField,
  setAuthMode,
  refreshNewEmailVerificationCodeTime,
  refreshNewAuthUpdateLinkTime,
  updateFormCheckboxes,
  setTwoFactorAuthToken,
  AuthMode,
} from './actions'

const REVOKE_SESSION = gql`
  mutation ($payload: String) {
    revokeRefreshToken(payload: $payload)
  }
`

const PREPARE_SIGN_UP_MUTATION = gql`
  mutation ($email: String!, $username: String!, $recaptchaTokenV2: String!) {
    prepareSignUp(input: { email: $email, username: $username, recaptchaTokenV2: $recaptchaTokenV2 })
  }
`

const SIGN_IN_MUTATION = gql`
  mutation ($email: String!, $password: String!) {
    signIn(input: { email: $email, password: $password }) {
      accessToken
      twoFactorAuthToken
    }
  }
`

const GOOGLE_AUTH_MUTATION = gql`
  mutation ($token: String!) {
    googleAuth(token: $token) {
      accessToken
    }
  }
`

const SIGN_UP_MUTATION = gql`
  mutation (
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

const REQUEST_PASSWORD_UPDATE_MUTATION = gql`
  mutation ($email: String!, $recaptchaTokenV2: String!) {
    requestPasswordUpdate(input: { email: $email, recaptchaTokenV2: $recaptchaTokenV2 })
  }
`

const REQUEST_TWO_FACTOR_AUTH_SECRET_REMOVAL_MUTATION = gql`
  mutation ($email: String!, $recaptchaTokenV2: String!) {
    requestTwoFactorAuthSecretRemoval(input: { email: $email, recaptchaTokenV2: $recaptchaTokenV2 })
  }
`

const UPDATE_PASSWORD_MUTATION = gql`
  mutation (
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

const REMOVE_TWO_FACTOR_AUTH_SECRET_MUTATION = gql`
  mutation ($email: String!, $token: String!) {
    removeTwoFactorAuthSecret(input: { email: $email, token: $token }) {
      accessToken
    }
  }
`

const SET_TWO_FACTOR_AUTH_SECRET_MUTATION = gql`
  mutation ($secret: String!, $code: String!) {
    setTwoFactorAuthSecret(input: { secret: $secret, code: $code })
  }
`

const TWO_FACTOR_AUTH_SIGN_IN_MUTATION = gql`
  mutation ($token: String!, $code: String!) {
    twoFactorAuthSignIn(input: { token: $token, code: $code }) {
      accessToken
    }
  }
`

export function useAuthMode(): AppState['auth']['authMode'] {
  return useAppSelector((state: AppState) => state.auth.authMode)
}

export function useSetAuthMode(): (authMode: AuthMode) => void {
  const dispatch = useAppDispatch()
  return useCallback((authMode: AuthMode) => dispatch(setAuthMode({ authMode })), [dispatch])
}

export function useAuthForm(): AppState['auth']['form'] {
  return useAppSelector((state: AppState) => state.auth.form)
}

// 2FA
export function useTwoFactorAuthToken(): AppState['auth']['twoFactorAuthToken'] {
  return useAppSelector((state: AppState) => state.auth.twoFactorAuthToken)
}

export function useSetTwoFactorAuthToken(): (token: string) => void {
  const dispatch = useAppDispatch()
  return useCallback((token: string) => dispatch(setTwoFactorAuthToken({ token })), [dispatch])
}

// email verification code time
export function useRefreshNewEmailVerificationCodeTime(): () => void {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(refreshNewEmailVerificationCodeTime()), [dispatch])
}

export function useNewEmailVerificationCodeTime(): AppState['auth']['newEmailVerificationCodeTime'] {
  return useAppSelector((state: AppState) => state.auth.newEmailVerificationCodeTime)
}

// Pasword update link time
export function useRefreshNewAuthUpdateLinkTime(): () => void {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(refreshNewAuthUpdateLinkTime()), [dispatch])
}

export function useNewAuthUpdateLinkTime(): AppState['auth']['newAuthUpdateLinkTime'] {
  return useAppSelector((state: AppState) => state.auth.newAuthUpdateLinkTime)
}

export function useAuthActionHanlders(): {
  onEmailInput: (email: string) => void
  onPasswordInput: (password: string) => void
  onUsernameInput: (username: string) => void
  onCheckboxChange: (key: string, value: boolean) => void
} {
  const dispatch = useAppDispatch()

  const onEmailInput = useCallback(
    (email: string) => {
      dispatch(updateEmailField({ email }))
    },
    [dispatch]
  )

  const onPasswordInput = useCallback(
    (password: string) => {
      dispatch(updatePasswordField({ password }))
    },
    [dispatch]
  )

  const onUsernameInput = useCallback(
    (username: string) => {
      dispatch(updateUsernameField({ username }))
    },
    [dispatch]
  )

  const onCheckboxChange = useCallback(
    (key: string, value: boolean) => {
      dispatch(updateFormCheckboxes({ key, value }))
    },
    [dispatch]
  )

  return {
    onEmailInput,
    onPasswordInput,
    onUsernameInput,
    onCheckboxChange,
  }
}

export function useRevokeSessionMutation() {
  return useMutation(REVOKE_SESSION)
}

export function usePrepareSignUpMutation() {
  return useMutation(PREPARE_SIGN_UP_MUTATION)
}

export function useSignInMutation() {
  return useMutation(SIGN_IN_MUTATION)
}

export function useSignUpMutation() {
  return useMutation(SIGN_UP_MUTATION)
}

export function useGoogleAuthMutation() {
  return useMutation(GOOGLE_AUTH_MUTATION)
}

export function useRequestPasswordUpdateMutation() {
  return useMutation(REQUEST_PASSWORD_UPDATE_MUTATION)
}

export function useUpdatePasswordMutation() {
  return useMutation(UPDATE_PASSWORD_MUTATION)
}

export function useSetTwoFactorAuthSecretMutation() {
  return useMutation(SET_TWO_FACTOR_AUTH_SECRET_MUTATION)
}

export function useTwoFactorAuthSignInMutation() {
  return useMutation(TWO_FACTOR_AUTH_SIGN_IN_MUTATION)
}

export function useRequestTwoFactorAuthSecretRemovalMutation() {
  return useMutation(REQUEST_TWO_FACTOR_AUTH_SECRET_REMOVAL_MUTATION)
}

export function useRemoveTwoFactorAuthSecretMutation() {
  return useMutation(REMOVE_TWO_FACTOR_AUTH_SECRET_MUTATION)
}
