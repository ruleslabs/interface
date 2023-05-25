import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { UserSlice, createUserSlice } from './user'
import { StarknetTxSlice, createStarknetTxSlice } from './starknetTx'

export type StoreState = UserSlice & StarknetTxSlice

const PERSISTING_KEYS: Array<keyof StoreState> = ['stxHash']

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
          ;(acc as any)[key] = state[key]
          return acc
        }, {} as StoreState),
    }
  )
)
