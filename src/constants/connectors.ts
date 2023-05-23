import { rulesSdk } from '@/lib/rulesWallet/rulesSdk'
import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'

function onError(error: Error) {
  console.debug(`web3-react error: ${error}`)
}

export const desiredChainId: number = rulesSdk.networkInfos.ethereumChainId

export const [metaMask, metaMaskHooks] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions, onError }))
