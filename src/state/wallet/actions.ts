import { createAction } from '@reduxjs/toolkit'

export enum WalletModalMode {
  WITHDRAW,
  DEPOSIT,
  RETRIEVE,
}

export interface WalletModalModePayload {
  walletModalMode: WalletModalMode | null
}

export const setWalletModalMode = createAction<WalletModalModePayload>('auth/setWalletModalMode')
