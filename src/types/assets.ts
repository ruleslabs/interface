import { ScarcityName } from '@rulesorg/sdk-core'

export interface NftAsset {
  imageUrl: string
  animationUrl: string
  tokenId: string
  scarcity: ScarcityName
}
