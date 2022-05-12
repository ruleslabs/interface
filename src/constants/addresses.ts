import { SupportedNetworks, SupportedChainIds } from './networks'

export type AddressMap = {
  [network: string]: string
  [chainId: number]: string
}

export const MULTICALL_ADDRESSES: AddressMap = {
  [SupportedNetworks.GOERLI]: '0x023b40e9df56f4c18025b5c27c8ae2132f29460ae8fbd4c49091be45a76244d2',
}

export const ETH_ADDRESSES: AddressMap = {
  [SupportedNetworks.GOERLI]: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
}

export const STARKGATE_ADDRESSES: AddressMap = {
  [SupportedChainIds.GOERLI]: '0xc3511006C04EF1d78af4C8E0e74Ec18A6E64Ff9e',
}
