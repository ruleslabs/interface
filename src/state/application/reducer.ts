import { createReducer } from '@reduxjs/toolkit'

import {
  setOpenedModal,
  setOpenedSidebarModal,
  updateEtherPrice,
  updateBlockNumber,
  updateEthereumBlockNumber,
  ApplicationModal,
  ApplicationSidebarModal,
} from './actions'

export interface ApplicationState {
  readonly openedModal: ApplicationModal | null
  readonly openedSidebarModal: ApplicationSidebarModal | null
  readonly etherPrice?: number
  readonly blockNumber?: number
  readonly ethereumBlockNumber: { readonly [chainId: number]: number }
}

export const initialState: ApplicationState = {
  openedModal: null,
  openedSidebarModal: null,
  blockNumber: 1, // set blockNumber to 1 to run the call listeners cause `get_block` is very slow atm
  ethereumBlockNumber: {},
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setOpenedModal, (state, { payload: { modal } }) => {
      state.openedModal = modal
    })
    .addCase(setOpenedSidebarModal, (state, { payload: { modal } }) => {
      state.openedSidebarModal = modal
    })
    .addCase(updateEtherPrice, (state, { payload: { price } }) => {
      state.etherPrice = price
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
