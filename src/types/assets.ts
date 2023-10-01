import { ScarcityName } from '@rulesorg/sdk-core'

export interface NftAsset {
  imageUrl: string
  animationUrl: string
  tokenId: string
  scarcity: ScarcityName
}

export interface CardModel {
  slug: string
  listedCardsCount?: number
  imageUrl: string
  animationUrl: string
  season: number
  artistName: string
  scarcityName: ScarcityName
  lowestAsk?: string
  lowSerialLowestAsk?: string
}

export interface Card {
  slug: string
  serialNumber: number
  ask?: string
  tokenId: string
  cardModel: CardModel
}
