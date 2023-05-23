import { immer } from 'zustand/middleware/immer'
import { Call } from 'starknet'
import { WeiAmount } from '@rulesorg/sdk-core'

export type StarknetTxSlice = State & Actions

export interface State {
  stxCalls: Call[]
  stxValue: WeiAmount
  stxSigning: boolean
}

export interface Actions {
  stxSetCalls: (calls: Call[]) => void
  stxPushCalls: (...calls: Call[]) => void
  stxSetSigning: (signing: boolean) => void
  stxResetStarknetTx: () => void
  stxIncreaseValue: (amount: WeiAmount) => void
}

const initialState = {
  stxCalls: [],
  stxValue: WeiAmount.ZERO,
  stxSigning: false,
}

export const createStarknetTxSlice = immer<StarknetTxSlice>((set) => ({
  ...initialState,

  // CALLS

  stxSetCalls: (calls: Call[]) => set({ stxCalls: calls }),
  stxPushCalls: (...calls: Call[]) =>
    set((state) => {
      state.stxCalls.push(...(calls as any[]))
    }),

  // TX VALUE

  stxIncreaseValue: (amount: WeiAmount) => set((state) => state.stxValue.add(amount)),

  // SIGNING

  stxSetSigning: (signing: boolean) => set({ stxSigning: signing }),

  // RESET

  stxResetStarknetTx: () => set(initialState),
}))
