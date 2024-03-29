import { ConnectionType } from 'src/connections'
import { GenieCurrentUser } from 'src/types'
import noop from 'src/utils/noop'
import { StateCreator } from 'zustand'

import { StoreState } from './index'

export type UserSlice = State & Actions

interface State {
  currentUser: GenieCurrentUser | null
  currentUserRefresher: () => void
  selectedL1Wallet: ConnectionType | null
}

interface Actions {
  setCurrentUser: (
    nextCurrentUserOrUpdated: GenieCurrentUser | null | ((prevCurrentUser: GenieCurrentUser | null) => void)
  ) => void

  setCurrentUserRefresher: (refresher: () => void) => void
  selectL1Wallet: (selectedL1Wallet: ConnectionType | null) => void
}

export const createUserSlice: StateCreator<StoreState, [['zustand/immer', never]], [], UserSlice> = (set) => ({
  currentUser: null,
  currentUserRefresher: noop,
  selectedL1Wallet: null,

  setCurrentUser: (nextCurrentUserOrUpdated) => {
    if (typeof nextCurrentUserOrUpdated === 'function') {
      set((state) => {
        nextCurrentUserOrUpdated(state.currentUser)
      })
    } else {
      set({ currentUser: nextCurrentUserOrUpdated })
    }
  },

  setCurrentUserRefresher: (refresher) => set({ currentUserRefresher: refresher }),

  selectL1Wallet: (selectedL1Wallet) => set({ selectedL1Wallet }),
})
