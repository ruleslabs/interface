import { RulesSdk, constants } from '@rulesorg/sdk-core'

const STARKNET_NETWORK_NAME = process.env.NEXT_PUBLIC_STARKNET_NETWORK_NAME ?? constants.DEFAULT_NETWORK_NAME
if (!Object.values(constants.StarknetNetworkName).includes(STARKNET_NETWORK_NAME as constants.StarknetNetworkName)) {
  throw 'STARKNET_NETWORK_NAME is invalid'
}

export const rulesSdk = new RulesSdk(STARKNET_NETWORK_NAME as constants.StarknetNetworkName)
