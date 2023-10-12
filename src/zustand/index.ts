import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import { UserSlice, createUserSlice } from './user'
import { StarknetTxSlice, createStarknetTxSlice } from './starknetTx'
import { ApplicationSlice, createApplicationSlice } from './application'
import { AssetsSlice, createAssetsSlice } from './assets'
import { L1WalletSlice, createL1WalletSlice } from './l1Wallet'

export type StoreState = UserSlice & StarknetTxSlice & ApplicationSlice & AssetsSlice & L1WalletSlice

const PERSISTING_KEYS: Array<keyof StoreState> = ['stxHash', 'stxAction', 'pendingOperations', 'executedStxs']

export const useBoundStore = create<StoreState>()(
  persist(
    immer<StoreState>((...a) => ({
      ...createUserSlice(...a),
      ...createStarknetTxSlice(...a),
      ...createApplicationSlice(...a),
      ...createAssetsSlice(...a),
      ...createL1WalletSlice(...a),
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
