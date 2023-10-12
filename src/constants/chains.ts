import { constants } from '@rulesorg/sdk-core'

export const CHAIN_IDS_TO_NAMES = {
  [constants.EthereumChainId.MAINNET]: 'mainnet',
  [constants.EthereumChainId.GOERLI]: 'goerli',

  [constants.StarknetChainId.MAINNET]: 'starknet mainnet',
  [constants.StarknetChainId.GOERLI]: 'starknet testnet',
}
