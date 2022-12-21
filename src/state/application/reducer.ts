import { createReducer } from '@reduxjs/toolkit'

import {
  setHomepageTabKey,
  setOpenModal,
  updateEtherPrice,
  updateBlockNumber,
  updateEthereumBlockNumber,
  ApplicationModal,
  HomepageTabs,
  HomepageTabKey,
} from './actions'

export interface ApplicationState {
  readonly openModal: ApplicationModal | null
  readonly etherPrice?: number
  readonly blockNumber?: number
  readonly ethereumBlockNumber: { readonly [chainId: number]: number }
  readonly homepageTabKey: HomepageTabKey
}

export const initialState: ApplicationState = {
  openModal: null,
  blockNumber: 1, // set blockNumber to 1 to run the call listeners cause `get_block` is very slow atm
  ethereumBlockNumber: {},
  homepageTabKey: Object.keys(HomepageTabs)[0],
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setHomepageTabKey, (state, { payload: { tabKey } }) => {
      state.homepageTabKey = tabKey
    })
    .addCase(setOpenModal, (state, { payload: { modal } }) => {
      state.openModal = modal
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
