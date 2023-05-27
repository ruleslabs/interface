import { StateCreator } from 'zustand'
import { Call } from 'starknet'
import { WeiAmount } from '@rulesorg/sdk-core'

import { StoreState } from './index'
import { createApplicationSlice } from './application'

export type StarknetTxSlice = State & Actions

export interface State {
  stxCalls: Call[]
  stxValue: WeiAmount
  stxSigning: boolean
  stxHash: null | string
}

export interface Actions {
  stxSetCalls: (calls: Call[]) => void
  stxPushCalls: (...calls: Call[]) => void
  stxSetSigning: (signing: boolean) => void
  stxResetStarknetTx: () => void
  stxIncreaseValue: (amount: WeiAmount) => void
  stxSetHash: (hash: string) => void
}

const resetState = {
  stxCalls: [],
  stxValue: WeiAmount.ZERO,
  stxSigning: false,
}

const initialState = {
  ...resetState,
  stxHash: null,
}

export const createStarknetTxSlice: StateCreator<StoreState, [['zustand/immer', never]], [], StarknetTxSlice> = (
  set,
  ...a
) => ({
  ...initialState,

  // CALLS

  stxSetCalls: (calls) => set({ stxCalls: calls }),
  stxPushCalls: (...calls: Call[]) =>
    set((state) => {
      state.stxCalls.push(...(calls as any[]))
    }),

  // TX VALUE

  stxIncreaseValue: (amount) =>
    set((state) => {
      state.stxValue = state.stxValue.add(amount)
    }),

  // SIGNING

  stxSetSigning: (signing) => set({ stxSigning: signing }),

  // RESET

  stxResetStarknetTx: () => set(resetState),

  // HASH

  stxSetHash: (hash) => {
    set({ stxHash: hash })

    createApplicationSlice(set, ...a).subscribeToOperations(hash)
  },
})
