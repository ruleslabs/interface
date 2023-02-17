import { createAction } from '@reduxjs/toolkit'

export enum ApplicationModal {
  SETTINGS,
  NAV,
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
}

export const HomepageTabs = {
  aside: 'Home',
  'last-offers': 'Last offers',
}

export type HomepageTabKey = keyof typeof HomepageTabs

export const setHomepageTabKey = createAction<{ tabKey: HomepageTabKey }>('application/setHomepageTabKey')
export const setOpenModal = createAction<{ modal: ApplicationModal | null }>('application/setOpenModal')
export const updateEtherPrice = createAction<{ price?: number }>('application/updateEtherPrice')
export const updateBlockNumber = createAction<{ blockNumber: number }>('application/updateBlockNumber')
export const updateEthereumBlockNumber = createAction<{ chainId: number; blockNumber: number }>(
  'application/updateEthereumBlockNumber'
)
