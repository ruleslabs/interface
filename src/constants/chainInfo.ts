import { SupportedChainId, constants } from '@rulesorg/sdk-core'

interface ChainInfo {
  readonly explorer: string
  readonly label: string
  readonly nativeCurrency: {
    name: string // e.g. 'Goerli ETH',
    symbol: string // e.g. 'gorETH',
    decimals: number // e.g. 18,
  }
}

type ChainInfoMap = { readonly [chainId in SupportedChainId]: ChainInfo } & {
  readonly [chainId: number | string]: ChainInfo
}

const CHAIN_INFO: ChainInfoMap = {
  [constants.EthereumChainId.MAINNET]: {
    explorer: 'https://etherscan.io/',
    label: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  [constants.EthereumChainId.GOERLI]: {
    explorer: 'https://goerli.etherscan.io/',
    label: 'Görli',
    nativeCurrency: { name: 'Görli Ether', symbol: 'görETH', decimals: 18 },
  },
  [constants.StarknetChainId.MAINNET]: {
    explorer: 'https://starkscan.co/',
    label: 'Starknet Mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  [constants.StarknetChainId.GOERLI]: {
    explorer: 'https://testnet.starkscan.co/',
    label: 'Starknet Görli',
    nativeCurrency: { name: 'Görli Ether', symbol: 'görETH', decimals: 18 },
  },
}

export function getChainInfo(chainId: constants.EthereumChainId | number | undefined): ChainInfo
export function getChainInfo(chainId: constants.StarknetChainId | string | undefined): ChainInfo

/**
 * Overloaded method for returning ChainInfo given a chainID
 * Return type varies depending on input type:
 * number | undefined -> returns chaininfo | undefined
 * SupportedChainId -> returns L1ChainInfo | L2ChainInfo
 * SupportedL1ChainId -> returns L1ChainInfo
 * SupportedL2ChainId -> returns L2ChainInfo
 */
export function getChainInfo(chainId: any): any {
  if (chainId) {
    return CHAIN_INFO[chainId] ?? undefined
  }
  return undefined
}
