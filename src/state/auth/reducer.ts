import { createReducer, PayloadAction } from '@reduxjs/toolkit'

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
  AuthFormCheckboxPayload,
  AuthEmailPayload,
  AuthUsernamePayload,
  AuthPasswordPayload,
  AuthModePayload,
  TokenPayload,
} from './actions'
import { EMAIL_VERIFICATION_INTERVAL } from 'src/constants/misc'

export interface AuthState {
  form: {
    email: string
    password: string
    username: string
    checkboxes: {
      acceptTos: boolean
      acceptCommercialEmails: boolean
    }
  }
  newEmailVerificationCodeTime?: number
  newAuthUpdateLinkTime?: number
  authMode: AuthMode | null
  twoFactorAuthToken: string | null
}

export const initialState: AuthState = {
  form: {
    email: '',
    password: '',
    username: '',
    checkboxes: {
      acceptTos: false,
      acceptCommercialEmails: false,
    },
  },
  newEmailVerificationCodeTime: undefined,
  newAuthUpdateLinkTime: undefined,
  authMode: null,
  twoFactorAuthToken: null,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateEmailField, (state, action: PayloadAction<AuthEmailPayload>) => {
      const { email } = action.payload
      state.form.email = email
    })
    .addCase(updatePasswordField, (state, action: PayloadAction<AuthPasswordPayload>) => {
      const { password } = action.payload
      state.form.password = password
    })
    .addCase(updateUsernameField, (state, action: PayloadAction<AuthUsernamePayload>) => {
      const { username } = action.payload
      state.form.username = username
    })
    .addCase(updateFormCheckboxes, (state, action: PayloadAction<AuthFormCheckboxPayload>) => {
      const { key, value } = action.payload
      state.form.checkboxes[key as keyof AuthState['form']['checkboxes']] = value
    })
    .addCase(refreshNewEmailVerificationCodeTime, (state) => {
      state.newEmailVerificationCodeTime = new Date().getTime() + EMAIL_VERIFICATION_INTERVAL
    })
    .addCase(refreshNewAuthUpdateLinkTime, (state) => {
      state.newAuthUpdateLinkTime = new Date().getTime() + EMAIL_VERIFICATION_INTERVAL
    })
    .addCase(setAuthMode, (state, action: PayloadAction<AuthModePayload>) => {
      const { authMode } = action.payload
      return { ...state, authMode }
    })
    .addCase(setTwoFactorAuthToken, (state, action: PayloadAction<TokenPayload>) => {
      const { token } = action.payload
      return { ...state, twoFactorAuthToken: token }
    })
)
