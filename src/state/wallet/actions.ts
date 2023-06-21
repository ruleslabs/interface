import { createAction } from '@reduxjs/toolkit'

export enum WalletModalMode {
  OVERVIEW,
  OLD_OVERVIEW,
  DEPOSIT,
  STARKGATE_DEPOSIT,
  STARKGATE_WITHDRAW,
  DEPLOY,
  MIGRATE_FUNDS,
}

export interface WalletModalModePayload {
  walletModalMode: WalletModalMode | null
}

export const setWalletModalMode = createAction<WalletModalModePayload>('auth/setWalletModalMode')
