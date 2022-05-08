import { createAction } from '@reduxjs/toolkit'

export enum ApplicationModal {
  SETTINGS,
  NAV,
  AUTH,
  DECK_INSERTION,
  PACK_PURCHASE,
  ONBOARDING,
}

export const setOpenModal = createAction<{ modal: ApplicationModal | null }>('application/setOpenModal')
export const updateBlockNumber = createAction<{ blockNumber: number }>('application/updateBlockNumber')
