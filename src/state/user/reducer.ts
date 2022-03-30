import { createReducer } from '@reduxjs/toolkit'

import { setCurrentUser } from './actions'

export interface UserState {
  currentUser: any | null
}

export const initialState: UserState = {
  currentUser: null,
}

export default createReducer(initialState, (builder) =>
  builder.addCase(setCurrentUser, (state, { payload: { user } }) => {
    return {
      ...state,
      currentUser: user,
    }
  })
)
