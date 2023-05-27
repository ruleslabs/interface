import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import { UserSlice, createUserSlice } from './user'
import { StarknetTxSlice, createStarknetTxSlice } from './starknetTx'
import { ApplicationSlice, createApplicationSlice } from './application'

export type StoreState = UserSlice & StarknetTxSlice & ApplicationSlice

const PERSISTING_KEYS: Array<keyof StoreState> = ['stxHash', 'pendingOperations']

export const useBoundStore = create<StoreState>()(
  persist(
    immer<StoreState>((...a) => ({
      ...createUserSlice(...a),
      ...createStarknetTxSlice(...a),
      ...createApplicationSlice(...a),
    })),
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
