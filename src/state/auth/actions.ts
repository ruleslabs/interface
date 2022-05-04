import { createAction } from '@reduxjs/toolkit'

export enum AuthMode {
  SIGN_IN,
  SIGN_UP,
  EMAIL_VERIFICATION,
}

export const updateEmailField = createAction<{ email: string }>('auth/updateEmailField')
export const updatePasswordField = createAction<{ password: string }>('auth/updatePasswordField')
export const updateUsernameField = createAction<{ username: string }>('auth/updateUsernameField')
export const updateEmailVerificationCodeField = createAction<{ code: string }>('auth/updateEmailVerificationCodeField')

export const refreshNewEmailVerificationCodeTime = createAction('auth/refreshNewEmailVerificationCodeTime')

export const setAuthMode = createAction<{ authMode: AuthMode | null }>('auth/setAuthMode')
