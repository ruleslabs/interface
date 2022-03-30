import { createReducer } from '@reduxjs/toolkit'

import { AuthMode, updateEmailField, updatePasswordField, updateUsernameField, setAuthMode } from './actions'

export interface AuthState {
  form: {
    email: string
    password: string
    username: string
  }
  authMode: AuthMode | null
}

export const initialState: AuthState = {
  form: {
    email: '',
    password: '',
    username: '',
  },
  authMode: null,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateEmailField, (state, { payload: { email } }) => {
      const form = state.form

      return {
        ...state,
        form: {
          ...form,
          email,
        },
      }
    })
    .addCase(updatePasswordField, (state, { payload: { password } }) => {
      const form = state.form

      return {
        ...state,
        form: {
          ...form,
          password,
        },
      }
    })
    .addCase(updateUsernameField, (state, { payload: { username } }) => {
      const form = state.form

      return {
        ...state,
        form: {
          ...form,
          username,
        },
      }
    })
    .addCase(setAuthMode, (state, { payload: { authMode } }) => {
      return { ...state, authMode }
    })
)
