import { useBoundStore } from '@/zustand'
import { StarknetWindowObject } from 'get-starknet-core'
import { rulesSdk } from './rulesSdk'
import { RulesAccount } from './RulesAccount'

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
  enable: async ({ starknetVersion = "v3" } = {}) => {
    const currentUser = useBoundStore.getState().currentUser

    const address = currentUser?.starknetWallet.address

    if (!address) {
      throw Error("No wallet account")
    }

    const { starknet } = window
    if (!starknet) {
      throw Error("No starknet object detected")
    }

    const provider = rulesSdk.starknet
    ;(starknet as any).starknetJsVersion = 'v5'
    starknet.provider = provider
    starknet.account = new RulesAccount(address, provider)

    starknet.selectedAddress = address
    starknet.chainId = rulesSdk.networkInfos.starknetChainId.toString()
    starknet.isConnected = true

    return [address]
  },
  isPreauthorized: async () => true,
  on: () => {},
  off: () => {},
}
