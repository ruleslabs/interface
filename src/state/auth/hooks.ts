import { useCallback } from 'react'

import { AppState } from 'src/state'
import { useAppDispatch, useAppSelector } from 'src/state/hooks'
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
