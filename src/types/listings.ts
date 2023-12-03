import { MessageSigningData } from 'src/graphql/data/__generated__/types-and-hooks'

import { CardModel } from './assets'

export interface CardListing {
  price: string
  orderSigningData: MessageSigningData
  createdAt: Date
  card: {
    serialNumber: number
  }
  cardModel: Pick<CardModel, 'slug' | 'imageUrl' | 'season' | 'scarcityName' | 'artistName'> & {
    scarcityMaxSupply?: number
  }
  offerer: {
    profile: {
      username?: string
      slug?: string
      imageUrl: string
      fallbackUrl: string
    }
    starknetAddress: string
  }
}
