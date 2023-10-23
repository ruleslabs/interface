import { BadgeType } from 'src/graphql/data/__generated__/types-and-hooks'

export interface GenieRetrievableEthers {
  amount: string
  l1Recipient: string
}

export interface GenieStarknetWallet {
  address: string
  oldAddress?: string

  rulesPrivateKey: {
    encryptedPrivateKey: string
    salt: string
    iv: string
  }

  publicKey: string
  currentPublicKey: string
  currentOldPublicKey?: string

  maintenance: boolean
  needsUpgrade: boolean
}

export interface GenieProfile {
  pictureUrl: string
  customAvatarUrl?: string
  fallbackUrl: string
  twitterUsername?: string
  instagramUsername?: string
  isDiscordVisible: boolean
  certified: boolean
  discordMember?: {
    username: string
    discriminator: string
    avatarUrl?: string
    id: string
  }
}

export interface GenieCurrentUser {
  id: string
  username: string
  slug: string
  email: string
  boughtStarterPack: boolean
  cScore: number
  rank: number
  unreadNotificationsCount: number
  retrievableEthers: Array<GenieRetrievableEthers>
  starknetWallet: GenieStarknetWallet
  hasTwoFactorAuthActivated: boolean
  profile: GenieProfile
  badges: Array<GenieBadge>
  admin: boolean
}

export interface GenieBadge {
  type: BadgeType
  level: number
  quantity: number
}

export interface GenieSearchedUser {
  address?: string
  publicKey: string
  id: string
  slug: string
  isCurrentUser: boolean
}
