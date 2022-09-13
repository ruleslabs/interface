import { createAction } from '@reduxjs/toolkit'

export enum ApplicationModal {
  SETTINGS,
  NAV,
  AUTH,
  DECK_INSERTION,
  PACK_PURCHASE,
  DEPOSIT,
  AVATAR_EDIT,
  PACK_OPENING_PREPARATION,
  OFFER,
  CREATE_OFFER,
  CANCEL_OFFER,
  ACCEPT_OFFER,
}

export const setOpenModal = createAction<{ modal: ApplicationModal | null }>('application/setOpenModal')
export const updateBlockNumber = createAction<{ blockNumber: number }>('application/updateBlockNumber')
export const updateEthereumBlockNumber = createAction<{ chainId: number; blockNumber: number }>(
  'application/updateEthereumBlockNumber'
)
