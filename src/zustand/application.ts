import { StateCreator } from 'zustand'

import { GenieSearchedUser, Operation, PendingOperation, PendingOperations } from 'src/types'
import { StoreState } from './index'

export type ApplicationSlice = State & Actions

export interface State {
  searchedUser: GenieSearchedUser | null
  operations: Operation[]
  pendingOperations: PendingOperations
}

export interface Actions {
  setSearchedUser: (searchedUser: GenieSearchedUser | null) => void
  pushOperation: (...operations: Operation[]) => void
  subscribeToOperations: (txHash: PendingOperation['txHash']) => void
  cleanOperations: () => void
}

export const createApplicationSlice: StateCreator<StoreState, [['zustand/immer', never]], [], ApplicationSlice> = (
  set
) => ({
  searchedUser: null,
  pendingOperations: {},
  operations: [],

  /* Search user */

  setSearchedUser: (searchedUser) => set({ searchedUser }),

  /* Pending operations */

  pushOperation: (...operations) =>
    set((state) => {
      state.operations.push(...(operations as any[]))
    }),

  cleanOperations: () => set({ operations: [] }),

  subscribeToOperations: (txHash) =>
    set((state) => {
      state.operations.map((operation) => {
        state.pendingOperations[operation.tokenId] ??= {}
        state.pendingOperations[operation.tokenId][txHash] = {
          quantity: operation.quantity,
          type: operation.type,
        }
      })

      // clean operations queue
      state.operations = []
    }),

  /* Modals (coming soon) */
})
