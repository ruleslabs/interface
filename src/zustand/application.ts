import { immer } from 'zustand/middleware/immer'

import { GenieSearchedUser } from 'src/types'

export type ApplicationSlice = State & Actions

export interface State {
  searchedUser: GenieSearchedUser | null
}

export interface Actions {
  setSearchedUser: (searchedUser: GenieSearchedUser | null) => void
}

export const createApplicationSlice = immer<ApplicationSlice>((set) => ({
  searchedUser: null,

  setSearchedUser: (searchedUser) => set({ searchedUser }),
}))
