import { ProviderInterface, Provider } from 'starknet'

import { DEFAULT_NETWORK } from '@/constants/networks'

export interface StarknetState {
  library?: ProviderInterface
  network?: string
}

export const STARKNET_INITIAL_STATE: StarknetState = {
  library: new Provider({ network: DEFAULT_NETWORK }),
  network: DEFAULT_NETWORK,
}
