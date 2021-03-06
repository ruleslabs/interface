import { createAction } from '@reduxjs/toolkit'

export enum ApplicationModal {
  SETTINGS,
  NAV,
  AUTH,
  DECK_INSERTION,
  PACK_PURCHASE,
  DEPOSIT,
  STARKNET_SIGNER,
  AVATAR_EDIT,
  PACK_OPENING_PREPARATION,
}

export const setOpenModal = createAction<{ modal: ApplicationModal | null }>('application/setOpenModal')
export const updateBlockNumber = createAction<{ blockNumber: number }>('application/updateBlockNumber')
export const updateEthereumBlockNumber = createAction<{ chainId: number; blockNumber: number }>(
  'application/updateEthereumBlockNumber'
)
