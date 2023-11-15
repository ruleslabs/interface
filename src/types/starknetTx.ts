import { WeiAmount } from '@rulesorg/sdk-core'

export interface ParsedNetworkFee {
  maxFee: WeiAmount
  fee: WeiAmount
  gasPrice: number
}

export type StxAction =
  | 'ethTransfer'
  | 'packTransfer'
  | 'transfer'
  | 'offerCreation'
  | 'offerAcceptance'
  | 'offerCancelation'
  | 'walletDeployment'
