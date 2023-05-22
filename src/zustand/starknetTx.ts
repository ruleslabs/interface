import { immer } from 'zustand/middleware/immer'
import { Call } from 'starknet'
import { WeiAmount } from '@rulesorg/sdk-core'

export type StarknetTxSlice = State & Actions

export interface State {
  calls: Array<Call>
  value: WeiAmount
  signing: boolean
}

export interface Actions {
  setCalls: (calls: Array<Call>) => void
  pushCalls: (...calls: Call[]) => void
  setSigning: (signing: boolean) => void
  resetStarknetTx: () => void
  increaseValue: (amount: WeiAmount) => void
}

const initialState = {
  calls: [],
  value: WeiAmount.fromRawAmount(0),
  signing: false,
}

export const createStarknetTxSlice = immer<StarknetTxSlice>((set) => ({
  ...initialState,

  // CALLS

  setCalls: (calls) => set({ calls }),
  pushCalls: (...calls: Call[]) => set((state) => state.calls.push(...(calls as any[]))),

  // TX VALUE

  increaseValue: (amount: WeiAmount) => set((state) => (state.value = state.value.add(amount))),

  // SIGNING

  setSigning: (signing: boolean) => set({ signing }),

  // RESET

  resetStarknetTx: () => set(initialState),
}))
