import { ProviderInterface } from 'starknet'

export interface StarknetState {
  provider?: ProviderInterface
  network?: string
}

export const STARKNET_INITIAL_STATE: StarknetState = {}
