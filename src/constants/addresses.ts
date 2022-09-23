import { SupportedNetworks, SupportedChainIds } from './networks'

export type AddressesMap = {
  [network: string]: string
  [chainId: number]: string
}

export const L2_MULTICALL_ADDRESSES: AddressesMap = {
  [SupportedNetworks.GOERLI]: '0x042a12c5a641619a6c58e623d5735273cdfb0e13df72c4bacb4e188892034bd6',
  [SupportedNetworks.MAINNET]: '0x0740a7a14618bb7e4688d10059bc42104d22c315bb647130630c77d3b6d3ee50',
}

export const L1_MULTICALL_ADDRESSES: AddressesMap = {
  [SupportedChainIds.GOERLI]: '0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e',
  [SupportedChainIds.MAINNET]: '0xeefba1e63905ef1d7acba5a8513c70307c1ce441',
}

export const ETH_ADDRESSES: AddressesMap = {
  [SupportedNetworks.GOERLI]: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
  [SupportedNetworks.MAINNET]: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
}

export const RULES_TOKENS_ADDRESSES: AddressesMap = {
  [SupportedNetworks.GOERLI]: '0x7fa3f31baeba9ba94778e40c716486280023e89ae296b88d699337da08c682d',
  [SupportedNetworks.MAINNET]: '0x046bfa580e4fa55a38eaa7f51a3469f86b336eed59a6136a07b7adcd095b0eb2',
}

export const MARKETPLACE_ADDRESSES: AddressesMap = {
  [SupportedNetworks.GOERLI]: '0x16a025e8c1f35f42e841cd8bff56f22ce706173cd044fffafdef5a355335219',
  [SupportedNetworks.MAINNET]: '0x63a4b3b0122cdaa6ba244739add94aed1d31e3330458cda833a8d119f28cbe8',
}

export const L1_STARKGATE_ADDRESSES: AddressesMap = {
  [SupportedChainIds.GOERLI]: '0xc3511006C04EF1d78af4C8E0e74Ec18A6E64Ff9e',
  [SupportedChainIds.MAINNET]: '0xae0Ee0A63A2cE6BaeEFFE56e7714FB4EFE48D419',
}

export const L2_STARKGATE_ADDRESSES: AddressesMap = {
  [SupportedNetworks.GOERLI]: '0x073314940630fd6dcda0d772d4c972c4e0a9946bef9dabf4ef84eda8ef542b82',
  [SupportedNetworks.MAINNET]: '0x073314940630fd6dcda0d772d4c972c4e0a9946bef9dabf4ef84eda8ef542b82',
}
