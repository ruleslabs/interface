import { createReducer } from '@reduxjs/toolkit'

import {
  ApplicationModal,
  ApplicationSidebarModal,
  setOpenedModal,
  setOpenedSidebarModal,
  setOpenedWalletConnectModal,
  updateBlock,
  updateEthereumBlockNumber,
  updateEtherPrice,
  WalletConnectModal,
} from './actions'

interface ApplicationState {
  readonly openedModal: ApplicationModal | null
  readonly openedSidebarModal: ApplicationSidebarModal | null
  readonly openedWalletConnectModal: WalletConnectModal | null

  readonly etherPrice?: number
  readonly blockNumber?: number
  readonly ethereumBlockNumber: { readonly [chainId: number]: number }
}

const initialState: ApplicationState = {
  openedModal: null,
  openedSidebarModal: null,
  openedWalletConnectModal: null,

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
    .addCase(setOpenedWalletConnectModal, (state, { payload: { modal } }) => {
      state.openedWalletConnectModal = modal
    })

    .addCase(updateEtherPrice, (state, { payload: { price } }) => {
      state.etherPrice = price
    })
    .addCase(updateBlock, (state, { payload: { block } }) => {
      state.blockNumber = Math.max(state.blockNumber ?? 0, block.block_number)
    })
    .addCase(updateEthereumBlockNumber, (state, { payload: { blockNumber, chainId } }) => {
      if (typeof state.ethereumBlockNumber[chainId] !== 'number') {
        state.ethereumBlockNumber[chainId] = blockNumber
      } else {
        state.ethereumBlockNumber[chainId] = Math.max(blockNumber, state.ethereumBlockNumber[chainId])
      }
    })
)
