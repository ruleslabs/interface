import { immer } from 'zustand/middleware/immer'

import { GenieSearchedUser, Operation, PendingOperation, PendingOperations } from 'src/types'

export type ApplicationSlice = State & Actions

export interface State {
  searchedUser: GenieSearchedUser | null
  pendingOperations: PendingOperations
}

export interface Actions {
  setSearchedUser: (searchedUser: GenieSearchedUser | null) => void
  subscribePendingOperations: (pendingOperation: Operation | Operation[], txHash: PendingOperation['txHash']) => void
}

export const createApplicationSlice = immer<ApplicationSlice>((set) => ({
  searchedUser: null,
  pendingOperations: {},

  setSearchedUser: (searchedUser) => set({ searchedUser }),

  subscribePendingOperations: (operation, txHash) => {
    const operations = Array.isArray(operation) ? operation : [operation]

    set((state) => {
      operations.map((operation) => {
        state.pendingOperations[operation.tokenId] ??= {}
        state.pendingOperations[operation.tokenId][txHash] = {
          quantity: operation.quantity,
          type: operation.type,
        }
      })
    })
  },
}))
