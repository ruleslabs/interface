import { createReducer, PayloadAction } from '@reduxjs/toolkit'

import { setWalletModalMode, WalletModalMode, WalletModalModePayload } from './actions'

interface WalletState {
  walletModalMode: WalletModalMode | null
}

const initialState: WalletState = {
  walletModalMode: null,
}

export default createReducer(initialState, (builder) =>
  builder.addCase(setWalletModalMode, (state, action: PayloadAction<WalletModalModePayload>) => {
    state.walletModalMode = action.payload.walletModalMode
  })
)
