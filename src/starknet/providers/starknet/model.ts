import { ProviderInterface } from 'starknet'

export interface StarknetState {
  library?: ProviderInterface
  network?: string
}

export const STARKNET_INITIAL_STATE: StarknetState = {}
