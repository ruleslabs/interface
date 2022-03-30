export enum SupportedNetworks {
  MAINNET = 'mainnet-alpha',
  GOERLI = 'goerli-alpha',
}

export type NetworkName = 'mainnet-alpha' | 'goerli-alpha'

export const DEFAULT_NETWORK = 'goerli-alpha'

export enum SupportedChainIds {
  MAINNET = 1,
  GOERLI = 5,
}

export const ChainIdsNetworksMap: { [network: string]: SupportedChainIds } = {
  [SupportedNetworks.GOERLI]: SupportedChainIds.GOERLI,
}

interface BasicChainInformation {
  urls: string[]
  name: string
}

export function isValidNetworkName(network?: string): network is NetworkName {
  return !!network && Object.values(SupportedNetworks).includes(network as SupportedNetworks)
}

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
