import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { UserSlice, createUserSlice } from './user'
import { StarknetTxSlice, createStarknetTxSlice } from './starknetTx'

export type StoreState = UserSlice & StarknetTxSlice

const PERSISTING_KEYS: Array<keyof StoreState> = []

export const useBoundStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createUserSlice(...a),
      ...createStarknetTxSlice(...a),
    }),
    {
      name: 'rules-state-storage',
      partialize: (state: StoreState) =>
        PERSISTING_KEYS.reduce<StoreState>((acc, key) => {
          acc[key] = state[key] as any
          return acc
        }, {} as StoreState),
    }
  )
)
