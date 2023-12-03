import { MAX_RECENT_WALLET_ACTIVITY_LEN } from 'src/constants/misc'
import { ExecutedTx, GenieSearchedUser, Operation, PendingOperation, PendingOperations } from 'src/types'
import { StateCreator } from 'zustand'

import { StoreState } from '../index'

export type ApplicationSlice = State & Actions

interface State {
  searchedUser: GenieSearchedUser | null

  executedStxs: ExecutedTx[]

  operations: Operation[]
  pendingOperations: PendingOperations
}

interface Actions {
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

  listings: {},

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
      for (const tokenId in state.pendingOperations) {
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
