import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'

import { ChainIdsNetworksMap, networkId } from '@/constants/networks'

function onError(error: Error) {
  console.debug(`web3-react error: ${error}`)
}

export const desiredChainId: number = ChainIdsNetworksMap[networkId]

export const [metaMask, metaMaskHooks] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions, onError }))
