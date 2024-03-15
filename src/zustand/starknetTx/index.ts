import { WeiAmount } from '@rulesorg/sdk-core'
import { Call, DeployAccountContractPayload } from 'starknet'
import { StateCreator } from 'zustand'

import { createApplicationSlice } from '../application'
import { StoreState } from '../index'

export type StarknetTxSlice = State & Actions

interface State {
  stxCalls: Call[]
  stxMessages: string[]
  stxAccountDeploymentPayload: DeployAccountContractPayload | null
  stxValue: {'ETH': WeiAmount, 'STRK': WeiAmount}
  stxSigning: boolean
  stxHash: string | null
  stxMigration: boolean
  stxBeforeExecutionCallback: ((calls: State['stxCalls'], maxFee: string) => Promise<Call[]>) | null
  stxAction: string | null
}

interface Actions {
  stxSetCalls: (calls: Call[]) => void
  stxPushCalls: (...calls: Call[]) => void

  stxPushMessages: (...hashes: string[]) => void

  stxSetAccountDeploymentPayload: (accountDeploymentPayload: DeployAccountContractPayload | null) => void

  stxSetSigning: (signing: boolean) => void

  stxResetStarknetTx: () => void

  stxIncreaseValue: (currency: 'ETH'|'STRK', amount: WeiAmount) => void

  stxSetHash: (hash: string | null, action?: string | null) => void

  stxSetMigration: (migration: boolean) => void

  stxSetBeforeExecutionCallback: (callback: (calls: State['stxCalls'], maxFee: string) => Promise<Call[]>) => void
}

const resetState = {
  stxCalls: [],
  stxMessages: [],
  stxAccountDeploymentPayload: null,
  stxValue: {'ETH': WeiAmount.ZERO, 'STRK': WeiAmount.ZERO},
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

  stxIncreaseValue: (currency, amount) =>
    set((state) => {
      state.stxValue[currency] = state.stxValue[currency].add(amount);
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
