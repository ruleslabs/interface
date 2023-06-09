import { useBoundStore } from 'src/zustand'
import { StarknetWindowObject } from 'get-starknet-core'
import { rulesSdk } from './rulesSdk'
import { RulesAccount } from './RulesAccount'
import { SequencerProvider } from 'starknet'

const VERSION = `${process.env.VERSION}`

// window.ethereum like
export const starknetWindowObject: StarknetWindowObject = {
  id: "rules",
  name: 'Rules',
  icon: '',
  account: undefined,
  provider: undefined,
  selectedAddress: undefined,
  chainId: undefined,
  isConnected: false,
  version: VERSION,
  request: async () => {
    throw Error("Not implemented")
  },
  enable: async () => {
    const currentUser = useBoundStore.getState().currentUser

    const address = currentUser?.starknetWallet.address
    const oldAddress = currentUser?.starknetWallet.oldAddress

    if (!address) {
      throw Error("No wallet account")
    }

    const { starknet_rules: starknet } = window
    if (!starknet) {
      throw Error("No starknet object detected")
    }

    // rulesSdk.starknet is not an instance of a vanilla starknet.js provider
    // then it is not supported by Account class and a default provider will be used
    const provider = new SequencerProvider({ baseUrl: rulesSdk.starknet.baseUrl })

    ;(starknet as any).starknetJsVersion = 'v5'
    starknet.provider = provider
    starknet.account = new RulesAccount(provider, address, '1', oldAddress)

    starknet.selectedAddress = address
    starknet.chainId = rulesSdk.networkInfos.starknetChainId.toString()
    starknet.isConnected = true

    return [address]
  },
  isPreauthorized: async () => true,
  on: () => {},
  off: () => {},
}
