import { createAction } from '@reduxjs/toolkit'

export enum AuthMode {
  SIGN_IN,
  SIGN_UP,
  EMAIL_VERIFICATION,
  REQUEST_PASSWORD_UPDATE,
  UPDATE_PASSWORD,
  TWO_FACTOR_AUTH,
}

export interface AuthEmailPayload {
  email: string
}

export interface AuthPasswordPayload {
  password: string
}

export interface AuthUsernamePayload {
  username: string
}

export interface AuthFormCheckboxPayload {
  key: string
  value: boolean
}

export interface AuthModePayload {
  authMode: AuthMode | null
}

export interface TokenPayload {
  token: string
}

export const updateEmailField = createAction<AuthEmailPayload>('auth/updateEmailField')
export const updatePasswordField = createAction<AuthPasswordPayload>('auth/updatePasswordField')
export const updateUsernameField = createAction<AuthUsernamePayload>('auth/updateUsernameField')
export const updateFormCheckboxes = createAction<AuthFormCheckboxPayload>('auth/updateFormCheckboxes')

export const refreshNewEmailVerificationCodeTime = createAction('auth/refreshNewEmailVerificationCodeTime')

export const refreshNewPasswordUpdateLinkTime = createAction('auth/refreshNewPasswordUpdateLinkTime')

export const setAuthMode = createAction<AuthModePayload>('auth/setAuthMode')
export const setTwoFactorAuthToken = createAction<TokenPayload>('auth/setTwoFactorAuthToken')
