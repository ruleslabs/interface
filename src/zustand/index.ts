import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { UserSlice, createUserSlice } from './user'

export type StoreState = UserSlice

const PERSISTING_KEYS: Array<keyof StoreState> = []

export const useBoundStore = create<StoreState>()(
  persist((...a) => ({ ...createUserSlice(...a) }), {
    name: 'rules-state-storage',
    partialize: (state: StoreState) =>
      PERSISTING_KEYS.reduce<StoreState>((acc, key) => {
        acc[key] = state[key] as any
        return acc
      }, {} as StoreState),
  })
)
