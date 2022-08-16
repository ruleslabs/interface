import { Provider } from 'starknet'

export interface StarknetState {
  provider?: Provider
  network?: string
}

export const STARKNET_INITIAL_STATE: StarknetState = {}
