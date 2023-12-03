import { createReducer } from '@reduxjs/toolkit'
import { SupportedLocale } from 'src/constants/locales'

import { updateUserLocale } from './actions'

interface UserState {
  userLocale: SupportedLocale | null
}

const initialState: UserState = {
  userLocale: null,
}

export default createReducer(initialState, (builder) =>
  builder.addCase(updateUserLocale, (state, action) => {
    state.userLocale = action.payload.userLocale
  })
)
