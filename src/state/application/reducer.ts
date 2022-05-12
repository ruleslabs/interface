import { createReducer } from '@reduxjs/toolkit'

import { setOpenModal, updateBlockNumber, updateEthereumBlockNumber, ApplicationModal } from './actions'

export interface ApplicationState {
  readonly openModal: ApplicationModal | null
  readonly blockNumber?: number
  readonly ethereumBlockNumber: { readonly [chainId: number]: number }
}

export const initialState: ApplicationState = {
  openModal: ApplicationModal.DEPOSIT, // null,
  ethereumBlockNumber: {},
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
    .addCase(updateEthereumBlockNumber, (state, { payload: { blockNumber, chainId } }) => {
      if (typeof state.ethereumBlockNumber[chainId] !== 'number') {
        state.ethereumBlockNumber[chainId] = blockNumber
      } else {
        state.ethereumBlockNumber[chainId] = Math.max(blockNumber, state.ethereumBlockNumber[chainId])
      }
    })
)
