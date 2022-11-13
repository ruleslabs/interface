import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query/react'
import { load, save } from 'redux-localstorage-simple'

import multicall from '@/lib/state/multicall'
import search from './search/reducer'
import application from './application/reducer'
import auth from './auth/reducer'
import user from './user/reducer'
import deck from './deck/reducer'
import onboarding from './onboarding/reducer'
import packOpening from './packOpening/reducer'
import wallet from './wallet/reducer'

const PERSISTED_KEYS: string[] = ['user']

const store = configureStore({
  reducer: {
    application,
    search,
    auth,
    user,
    deck,
    onboarding,
    packOpening,
    wallet,
    multicall: multicall.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false, thunk: true }).concat(
      save({ states: PERSISTED_KEYS, debounce: 1000 })
    ),
  preloadedState: load({ states: PERSISTED_KEYS, disableWarnings: process.env.NODE_ENV !== 'production' }),
})

setupListeners(store.dispatch)

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
