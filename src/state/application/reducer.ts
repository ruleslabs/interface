import { createReducer } from '@reduxjs/toolkit'

import { setOpenModal, updateBlockNumber, ApplicationModal } from './actions'

export interface ApplicationState {
  openModal: ApplicationModal | null
  blockNumber?: number
}

export const initialState: ApplicationState = {
  openModal: null,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setOpenModal, (state, { payload: { modal } }) => {
      return {
        ...state,
        openModal: modal,
      }
    })
    .addCase(updateBlockNumber, (state, { payload: { blockNumber } }) => {
      state.blockNumber = Math.max(state.blockNumber ?? 0, blockNumber)
    })
)
