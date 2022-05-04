import { useCallback } from 'react'
import { useMutation, gql } from '@apollo/client'

import { AppState } from '@/state'
import { EMAIL_VERIFICATION_CODE_LENGTH } from '@/constants/misc'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  updateEmailField,
  updatePasswordField,
  updateUsernameField,
  updateEmailVerificationCodeField,
  setAuthMode,
  refreshNewEmailVerificationCodeTime,
  AuthMode,
} from './actions'

const REVOKE_SESSION = gql`
  mutation ($payload: String) {
    revokeRefreshToken(payload: $payload)
  }
`

const PREPARE_SIGN_UP_MUTATION = gql`
  mutation ($email: String!, $username: String!) {
    prepareSignUp(input: { email: $email, username: $username })
  }
`

const SIGN_IN_MUTATION = gql`
  mutation ($email: String!, $password: String!) {
    signIn(input: { email: $email, password: $password }) {
      accessToken
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
    $starknetAddress: String!
    $rulesPrivateKey: RulesPrivateKeyAttributes!
    $rulesPrivateKeyBackup: String!
    $emailVerificationCode: String!
  ) {
    signUp(
      input: {
        email: $email
        username: $username
        password: $password
        starknetAddress: $starknetAddress
        rulesPrivateKey: $rulesPrivateKey
        rulesPrivateKeyBackup: $rulesPrivateKeyBackup
        emailVerificationCode: $emailVerificationCode
      }
    ) {
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

export function useRefreshNewEmailVerificationCodeTime(): () => void {
  const dispatch = useAppDispatch()
  return useCallback((authMode: AuthMode) => dispatch(refreshNewEmailVerificationCodeTime()), [dispatch])
}

export function useNewEmailVerificationCodeTime(): AppState['auth']['newEmailVerificationCodeTime'] {
  return useAppSelector((state: AppState) => state.auth.newEmailVerificationCodeTime)
}

export function useAuthActionHanlders(): {
  onEmailInput: (email: string) => void
  onPasswordInput: (password: string) => void
  onUsernameInput: (username: string) => void
  onEmailVerificationCodeInput: (code: string) => void
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

  const onEmailVerificationCodeInput = useCallback(
    (code: string) => {
      if (/^[\d]*$/.test(code) && code.length <= EMAIL_VERIFICATION_CODE_LENGTH)
        dispatch(updateEmailVerificationCodeField({ code }))
    },
    [dispatch]
  )

  return {
    onEmailInput,
    onPasswordInput,
    onUsernameInput,
    onEmailVerificationCodeInput,
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
