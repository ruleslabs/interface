import { SupportedNetworks } from './networks'

export type AddressMap = { [network: string]: string }

export const MULTICALL_ADDRESSES: AddressMap = {
  [SupportedNetworks.GOERLI]: '0x023b40e9df56f4c18025b5c27c8ae2132f29460ae8fbd4c49091be45a76244d2',
}

export const ETH_ADDRESSES: AddressMap = {
  [SupportedNetworks.GOERLI]: '0x07394cbe418daa16e42b87ba67372d4ab4a5df0b05c6e554d158458ce245bc10',
}
