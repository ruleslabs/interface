import { createReducer } from '@reduxjs/toolkit'

import {
  updateEmailField,
  updatePasswordField,
  updateUsernameField,
  setAuthMode,
  refreshNewEmailVerificationCodeTime,
  AuthMode,
} from './actions'
import { EMAIL_VERIFICATION_INTERVAL } from '@/constants/misc'

export interface AuthState {
  form: {
    email: string
    password: string
    username: string
  }
  newEmailVerificationCodeTime?: number
  authMode: AuthMode | null
}

export const initialState: AuthState = {
  form: {
    email: '',
    password: '',
    username: '',
  },
  newEmailVerificationCodeTime: undefined,
  authMode: null,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateEmailField, (state, { payload: { email } }) => {
      state.form.email = email
    })
    .addCase(updatePasswordField, (state, { payload: { password } }) => {
      state.form.password = password
    })
    .addCase(updateUsernameField, (state, { payload: { username } }) => {
      state.form.username = username
    })
    .addCase(refreshNewEmailVerificationCodeTime, (state) => {
      state.newEmailVerificationCodeTime = new Date().getTime() + EMAIL_VERIFICATION_INTERVAL
    })
    .addCase(setAuthMode, (state, { payload: { authMode } }) => {
      return { ...state, authMode }
    })
)
