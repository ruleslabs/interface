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

export function useStarknetManager(): StarknetState {
  const networkUrl = ProviderUrlNetworksMap[networkId]

  const [state] = useReducer(reducer, {
    provider: new Provider(
      networkUrl ? { sequencer: { baseUrl: networkUrl, feederGatewayUrl: 'feeder_gateway' } } : undefined
    ),
    network: networkId,
  })

  return state
}
