import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'

import { ChainIdsNetworksMap, DEFAULT_NETWORK } from '@/constants/networks'

export const desiredChainId: number =
  ChainIdsNetworksMap[process.env.NEXT_PUBLIC_STARKNET_NETWORK_ID ?? ''] ?? ChainIdsNetworksMap[DEFAULT_NETWORK]

export const [metaMask, metaMaskHooks] = initializeConnector<MetaMask>((actions) => new MetaMask(actions))
