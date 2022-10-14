export enum SupportedNetworks {
  MAINNET = 'mainnet-alpha',
  GOERLI = 'goerli-alpha',
}

export const ProviderUrlNetworksMap: { [network: string]: string } = {
  [SupportedNetworks.GOERLI]: 'https://alpha4.starknet.io',
  [SupportedNetworks.MAINNET]: 'https://alpha-mainnet.starknet.io',
}

export const feederGatewayUrl = 'feeder_gateway'
export const gatewayUrl = 'gateway'

export const defaultNetwork = SupportedNetworks.GOERLI
export const networkId = process.env.NEXT_PUBLIC_STARKNET_NETWORK_ID ?? defaultNetwork

export enum SupportedChainIds {
  MAINNET = 1,
  GOERLI = 5,
}

export const ChainIdsNetworksMap: { [network: string]: SupportedChainIds } = {
  [SupportedNetworks.GOERLI]: SupportedChainIds.GOERLI,
  [SupportedNetworks.MAINNET]: SupportedChainIds.MAINNET,
}

interface BasicNetworkInformation {
  name: string
  explorerBaseUrl: string
}

export const NETWORKS: { [networkId: string]: BasicNetworkInformation } = {
  [SupportedNetworks.GOERLI]: {
    name: 'Alpha Goerli',
    explorerBaseUrl: 'https://testnet.starkscan.co/tx',
  },
  [SupportedNetworks.MAINNET]: {
    name: 'Alpha Mainnet',
    explorerBaseUrl: 'https://starkscan.co/tx',
  },
}

export const CHAINS: { [chainId: number]: BasicNetworkInformation } = {
  [SupportedChainIds.GOERLI]: {
    name: 'Goerli',
    explorerBaseUrl: 'https://goerli.etherscan.io',
  },
  [SupportedChainIds.MAINNET]: {
    name: 'Mainnet',
    explorerBaseUrl: 'https://etherscan.io',
  },
}
