import { createReducer } from '@reduxjs/toolkit'

import { SupportedLocale } from '@/constants/locales'
import { setCurrentUser, updateUserLocale } from './actions'

export interface UserState {
  currentUser: any | null
  userLocale: SupportedLocale | null
}

export const initialState: UserState = {
  currentUser: null,
  userLocale: null,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setCurrentUser, (state, { payload: { user } }) => {
      return {
        ...state,
        currentUser: user,
      }
    })
    .addCase(updateUserLocale, (state, action) => {
      state.userLocale = action.payload.userLocale
    })
)
