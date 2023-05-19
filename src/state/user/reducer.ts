import { createReducer } from '@reduxjs/toolkit'

import { SupportedLocale } from '@/constants/locales'
import { updateUserLocale } from './actions'

export interface UserState {
  userLocale: SupportedLocale | null
}

export const initialState: UserState = {
  userLocale: null,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateUserLocale, (state, action) => {
      state.userLocale = action.payload.userLocale
    })
)
