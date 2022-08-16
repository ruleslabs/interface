import { useReducer } from 'react'
import { Provider } from 'starknet'

import { networkId, ProviderUrlNetworksMap } from '@/constants/networks'
import { StarknetState } from './model'

interface StarknetStateManager {
  provider: Provider
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
    network: networkId,
  })

  return state
}
