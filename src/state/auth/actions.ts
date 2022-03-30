import { createAction } from '@reduxjs/toolkit'

export enum AuthMode {
  SIGN_IN,
  SIGN_UP,
}

export const updateEmailField = createAction<{ email: string }>('auth/updateEmailField')
export const updatePasswordField = createAction<{ password: string }>('auth/updatePasswordField')
export const updateUsernameField = createAction<{ username: string }>('auth/updateUsernameField')
export const setAuthMode = createAction<{ authMode: AuthMode | null }>('auth/setAuthMode')
