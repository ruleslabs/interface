export enum SupportedNetworks {
  MAINNET = 'mainnet-alpha',
  GOERLI = 'goerli-alpha',
}

export const ProviderUrlNetworksMap: { [network: string]: string } = {
  [SupportedNetworks.GOERLI]: 'https://alpha4.starknet.io',
}

export const defaultNetwork = SupportedNetworks.GOERLI
export const networkId = process.env.STARKNET_NETWORK_ID ?? defaultNetwork

export const DEFAULT_NETWORK = SupportedNetworks.GOERLI

export enum SupportedChainIds {
  MAINNET = 1,
  GOERLI = 5,
}

export const ChainIdsNetworksMap: { [network: string]: SupportedChainIds } = {
  [SupportedNetworks.GOERLI]: SupportedChainIds.GOERLI,
}

// interface BasicChainInformation {
//   urls: string[]
//   name: string
// }
// 
// export const CHAINS: { [chainId: number]: BasicChainInformation } = {
//   1: {
//     urls: [
//       process.env.NEXT_PUBLIC_INFURA_KEY
//         ? `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`
//         : undefined,
//       'https://cloudflare-eth.com',
//     ].filter((url) => url !== undefined),
//     name: 'Mainnet',
//   },
//   5: {
//     urls: [
//       process.env.NEXT_PUBLIC_INFURA_KEY
//         ? `https://goerli.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`
//         : undefined,
//     ].filter((url) => url !== undefined),
//     name: 'Görli',
//   },
// }
