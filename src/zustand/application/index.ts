import { StateCreator } from 'zustand'

import { ExecutedTx, GenieSearchedUser, Operation, PendingOperation, PendingOperations } from 'src/types'
import { StoreState } from '../index'
import { MAX_RECENT_WALLET_ACTIVITY_LEN } from 'src/constants/misc'

export type ApplicationSlice = State & Actions

export interface State {
  searchedUser: GenieSearchedUser | null

  executedStxs: ExecutedTx[]

  operations: Operation[]
  pendingOperations: PendingOperations
}

export interface Actions {
  setSearchedUser: (searchedUser: GenieSearchedUser | null) => void

  saveExecutedStx: (executedStx: ExecutedTx) => void

  pushOperation: (...operations: Operation[]) => void
  subscribeToOperations: (txHash: PendingOperation['txHash']) => void
  cleanOperations: () => void
  unsubscribeFromPendingOperation: (txHash: string) => void
}

export const createApplicationSlice: StateCreator<StoreState, [['zustand/immer', never]], [], ApplicationSlice> = (
  set
) => ({
  searchedUser: null,

  executedStxs: [],

  pendingOperations: {},
  operations: [],

  /* Search user */

  setSearchedUser: (searchedUser) => set({ searchedUser }),

  /* Executed stxs */

  saveExecutedStx: (executedStx) =>
    set((state) => {
      // add the new executed tx at the begining of the array,
      // and remove the last array if there's too much executed txs saved
      if (state.executedStxs.unshift(executedStx) > MAX_RECENT_WALLET_ACTIVITY_LEN) {
        state.executedStxs.pop()
      }
    }),

  /* Pending operations */

  pushOperation: (...operations) =>
    set((state) => {
      state.operations.push(...(operations as any[]))
    }),

  cleanOperations: () => set({ operations: [] }),

  unsubscribeFromPendingOperation: (txHash) =>
    set((state) => {
      for (const tokenId of Object.keys(state.pendingOperations)) {
        delete state.pendingOperations[tokenId][txHash]
      }
    }),

  subscribeToOperations: (txHash) =>
    set((state) => {
      state.operations.map((operation) => {
        state.pendingOperations[operation.tokenId] ??= {}
        state.pendingOperations[operation.tokenId][txHash] = {
          quantity: operation.quantity,
          action: operation.action,
        }
      })

      // clean operations queue
      state.operations = []
    }),

  /* Modals (coming soon) */
})
