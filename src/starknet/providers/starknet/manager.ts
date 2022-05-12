import { useReducer } from 'react'
import { Provider, ProviderInterface } from 'starknet'

import { DEFAULT_NETWORK, networkId, ProviderUrlNetworksMap } from '@/constants/networks'
import { StarknetState } from './model'

interface StarknetStateManager {
  provider: ProviderInterface
  network: string
}

type Action = undefined

function reducer(state: StarknetStateManager, action: Action): StarknetStateManager {
  return state // empty reducer for the moment
}

interface UseStarknetManagerProps {
  network?: string
}

export function useStarknetManager({ network }: UseStarknetManagerProps): StarknetState {
  const networkUrl = ProviderUrlNetworksMap[networkId]

  const [state, dispatch] = useReducer(reducer, {
    provider: new Provider(networkUrl ? { baseUrl: networkUrl } : undefined),
    network: networkUrl ? networkId : DEFAULT_NETWORK,
  })

  return state
}
