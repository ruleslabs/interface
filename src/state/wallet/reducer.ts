import { createReducer, PayloadAction } from '@reduxjs/toolkit'

import { setWalletModalMode, WalletModalModal, WalletModalModePayload } from './actions'

export interface WalletState {
  walletModalMode: WalletModalModal | null
}

export const initialState: AuthState = {
  walletModalMode: null,
}

export default createReducer(initialState, (builder) =>
  builder.addCase(setWalletModalMode, (state, action: PayloadAction<WalletModalModePayload>) => {
    state.walletModalMode = action.payload.walletModalMode
  })
)
