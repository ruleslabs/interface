import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query/react'

import multicall from '@/lib/state/multicall'
import search from './search/reducer'
import application from './application/reducer'
import auth from './auth/reducer'
import user from './user/reducer'
import deck from './deck/reducer'
import onboarding from './onboarding/reducer'

const store = configureStore({
  reducer: {
    application,
    search,
    auth,
    user,
    deck,
    onboarding,
    multicall: multicall.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: true }),
})

setupListeners(store.dispatch)

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
