import { StateCreator } from 'zustand'
import { Call, DeployAccountContractPayload } from 'starknet'
import { WeiAmount } from '@rulesorg/sdk-core'

import { StoreState } from '../index'
import { createApplicationSlice } from '../application'

export type StarknetTxSlice = State & Actions

export interface State {
  stxCalls: Call[]
  stxMessages: string[]
  stxAccountDeploymentPayload: DeployAccountContractPayload | null
  stxValue: WeiAmount
  stxSigning: boolean
  stxHash: string | null
  stxMigration: boolean
  stxBeforeExecutionCallback: ((calls: State['stxCalls'], maxFee: string) => Promise<Call[]>) | null
  stxAction: string | null
}

export interface Actions {
  stxSetCalls: (calls: Call[]) => void
  stxPushCalls: (...calls: Call[]) => void

  stxPushMessages: (...hashes: string[]) => void

  stxSetAccountDeploymentPayload: (accountDeploymentPayload: DeployAccountContractPayload | null) => void

  stxSetSigning: (signing: boolean) => void

  stxResetStarknetTx: () => void

  stxIncreaseValue: (amount: WeiAmount) => void

  stxSetHash: (hash: string | null, action?: string | null) => void

  stxSetMigration: (migration: boolean) => void

  stxSetBeforeExecutionCallback: (callback: (calls: State['stxCalls'], maxFee: string) => Promise<Call[]>) => void
}

const resetState = {
  stxCalls: [],
  stxMessages: [],
  stxAccountDeploymentPayload: null,
  stxValue: WeiAmount.ZERO,
  stxSigning: false,
  stxMigration: false,
  stxBeforeExecutionCallback: null,
}

const initialState: State = {
  ...resetState,
  stxHash: null,
  stxAction: null,
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

  // MESSAGES

  stxPushMessages: (...hashes: string[]) =>
    set((state) => {
      state.stxMessages.push(...(hashes as any[]))
    }),

  // DEPLOY

  stxSetAccountDeploymentPayload: (accountDeploymentPayload) =>
    set({ stxAccountDeploymentPayload: accountDeploymentPayload }),

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

  stxSetHash: (hash, action = null) => {
    if (!hash !== !action) throw 'Bad stx input'

    set({ stxHash: hash, stxAction: action })

    if (hash) createApplicationSlice(set, ...a).subscribeToOperations(hash)
  },

  // MIGRATION

  stxSetMigration: (migration) => set({ stxMigration: migration }),

  // CALLBACK

  stxSetBeforeExecutionCallback: (callback: (calls: State['stxCalls'], maxFee: string) => Promise<Call[]>) =>
    set({ stxBeforeExecutionCallback: callback }),
})
