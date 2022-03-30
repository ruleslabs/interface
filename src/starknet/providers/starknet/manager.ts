import { useReducer } from 'react'
import { Provider, ProviderInterface } from 'starknet'

import { DEFAULT_NETWORK, isValidNetworkName, NetworkName } from '@/constants/networks'
import { StarknetState } from './model'

interface StarknetStateManager {
  library: ProviderInterface
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
  const networkName: NetworkName = isValidNetworkName(network) ? network : DEFAULT_NETWORK

  const [state, dispatch] = useReducer(reducer, {
    library: new Provider({ network: networkName }),
    network: networkName,
  })

  return state
}
