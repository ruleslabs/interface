import { SupportedNetworks } from './networks'

export type AddressMap = { [network: string]: string }

export const MULTICALL_ADDRESSES: AddressMap = {
  [SupportedNetworks.GOERLI]: '0x023b40e9df56f4c18025b5c27c8ae2132f29460ae8fbd4c49091be45a76244d2',
}

export const ETH_ADDRESSES: AddressMap = {
  [SupportedNetworks.GOERLI]: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
}
