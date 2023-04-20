import { createAction } from '@reduxjs/toolkit'

export enum ApplicationModal {
  SETTINGS,
  NAV_USER_DESKTOP,
  AUTH,
  DECK_INSERTION,
  PACK_PURCHASE,
  WALLET,
  AVATAR_EDIT,
  OFFER,
  CREATE_OFFER,
  CANCEL_OFFER,
  ACCEPT_OFFER,
  UPGRADE_WALLET,
  MARKETPLACE_FILTERS,
  STARKNET_ACCOUNT_PRIVATE_KEY,
  RETRIEVE_ETHERS,
  LIVE_REWARD_DETAILS,
  LIVE_REWARD_TICKET,
  CLAIM_LIVE_REWARD,
}

export enum ApplicationSidebarModal {
  NAV_MOBILE,
  NAV_USER_MOBILE,
  NOTIFICATIONS,
}

export const setOpenedModal = createAction<{ modal: ApplicationModal | null }>('application/setOpenModal')
export const setOpenedSidebarModal = createAction<{ modal: ApplicationSidebarModal | null }>(
  'application/setOpenSidebarModal'
)

export const updateEtherPrice = createAction<{ price?: number }>('application/updateEtherPrice')
export const updateBlockNumber = createAction<{ blockNumber: number }>('application/updateBlockNumber')
export const updateEthereumBlockNumber = createAction<{ chainId: number; blockNumber: number }>(
  'application/updateEthereumBlockNumber'
)
