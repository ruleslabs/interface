import { ProviderInterface, Provider } from 'starknet'

import { DEFAULT_NETWORK } from '@/constants/networks'

export interface StarknetState {
  library?: ProviderInterface
  network?: string
}

export const STARKNET_INITIAL_STATE: StarknetState = {
  library: new Provider({ network: process.env.NEXT_PUBLIC_STARKNET_NETWORK_ID ?? DEFAULT_NETWORK }),
  network: process.env.NEXT_PUBLIC_STARKNET_NETWORK_ID ?? DEFAULT_NETWORK,
}
