import { useCallback } from 'react'
import { useMutation, gql } from '@apollo/client'

import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { updateEmailField, updatePasswordField, updateUsernameField, setAuthMode, AuthMode } from './actions'

const REVOKE_SESSION = gql`
  mutation ($payload: String) {
    revokeRefreshToken(payload: $payload)
  }
`

export function useAuthMode(): AuthMode | null {
  return useAppSelector((state) => state.auth.authMode)
}

export function useSetAuthMode(): (authMode: AuthMode) => void {
  const dispatch = useAppDispatch()
  return useCallback((authMode: AuthMode) => dispatch(setAuthMode({ authMode })), [dispatch])
}

export function useAuthForm() {
  return useAppSelector((state) => state.auth.form)
}

export function useAuthActionHanlders(): {
  onEmailInput: (email: string) => void
  onPasswordInput: (password: string) => void
  onUsernameInput: (username: string) => void
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

  return {
    onEmailInput,
    onPasswordInput,
    onUsernameInput,
  }
}

export function useRevokeSessionMutation() {
  return useMutation(REVOKE_SESSION)
}
