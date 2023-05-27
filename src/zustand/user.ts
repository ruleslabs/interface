import { StateCreator } from 'zustand'

import { GenieCurrentUser } from 'src/types'
import { StoreState } from './index'

export type UserSlice = State & Actions

export interface State {
  currentUser: GenieCurrentUser | null
  currentUserRefresher: () => void
}

export interface Actions {
  setCurrentUser: (
    nextCurrentUserOrUpdated: GenieCurrentUser | null | ((prevCurrentUser: GenieCurrentUser | null) => void)
  ) => void

  setCurrentUserRefresher: (refresher: () => void) => void
}

export const createUserSlice: StateCreator<StoreState, [['zustand/immer', never]], [], UserSlice> = (set) => ({
  currentUser: null,
  currentUserRefresher: () => {},

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
})
