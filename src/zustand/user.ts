import { immer } from 'zustand/middleware/immer'

import { GenieCurrentUser } from '@/types'

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

export const createUserSlice = immer<UserSlice>((set) => ({
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
}))
