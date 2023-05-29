import { StateCreator } from 'zustand'

import { StoreState } from '../index'

export type AssetsSlice = State & Actions

export interface State {
  selectedTokenIds: string[]
  selectionModeEnabled: boolean

  tokenIdPlayingMedia: string | null
}

export interface Actions {
  toggleTokenIdSelection: (tokenId: string) => void
  toggleSelectionMode: () => void

  setTokenIdPlayingMedia: (tokenId: string | null) => void
}

export const createAssetsSlice: StateCreator<StoreState, [['zustand/immer', never]], [], AssetsSlice> = (set) => ({
  selectedTokenIds: [],
  selectionModeEnabled: false,
  tokenIdPlayingMedia: null,

  /* Selection */

  toggleTokenIdSelection: (tokenId) =>
    set((state) => {
      const indexOf = state.selectedTokenIds.indexOf(tokenId)

      if (indexOf < 0) state.selectedTokenIds.push(tokenId)
      else state.selectedTokenIds.splice(indexOf, 1)
    }),

  toggleSelectionMode: () =>
    set((state) => {
      state.selectionModeEnabled = !state.selectionModeEnabled
      state.selectedTokenIds = []

      // disable media playing on selection mode
      if (state.selectionModeEnabled) state.tokenIdPlayingMedia = null
    }),

  /* Media playing */

  setTokenIdPlayingMedia: (tokenId) => set({ tokenIdPlayingMedia: tokenId }),
})
