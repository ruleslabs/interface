import { SequencerProvider } from 'starknet'

export interface StarknetState {
  provider?: SequencerProvider
  network?: string
}

export const STARKNET_INITIAL_STATE: StarknetState = {}
