import { createAction } from '@reduxjs/toolkit'

export enum WalletModalMode {
  DEPOSIT,
  STARKGATE_DEPOSIT,
  WITHDRAW,
  STARKGATE_WITHDRAW,
}

export interface WalletModalModePayload {
  walletModalMode: WalletModalMode | null
}

export const setWalletModalMode = createAction<WalletModalModePayload>('auth/setWalletModalMode')
