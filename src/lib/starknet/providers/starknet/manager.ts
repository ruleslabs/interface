import { useReducer } from 'react'
import { SequencerProvider } from 'starknet'

import { networkId, ProviderUrlNetworksMap } from '@/constants/networks'
import { StarknetState } from './model'

interface StarknetStateManager extends StarknetState {}

type Action = undefined

function reducer(state: StarknetStateManager, action: Action): StarknetStateManager {
  return state // empty reducer for the moment
}

export function useStarknetManager(): StarknetState {
  const networkUrl = ProviderUrlNetworksMap[networkId]

  const [state] = useReducer(reducer, {
    provider: new SequencerProvider(
      networkUrl ? { baseUrl: networkUrl, feederGatewayUrl: 'feeder_gateway' } : undefined
    ),
    network: networkId,
  })

  return state
}
