import { constants } from '@rulesorg/sdk-core'

export interface GenieRetrievableEthers {
  amount: string
  l1Recipient: string
}

export interface GenieStarknetWallet {
  address: string
  oldAddress?: string
  publicKey: string
  currentPublicKey: string
  lockingReason: constants.StarknetWalletLockingReason
  signerEscapeTriggeredAt?: Date
  needsUpgrade: boolean
  rulesPrivateKey: {
    salt: string
    iv: string
    encryptedPrivateKey: string
  }
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
  }
}

export interface GenieCurrentUser {
  id: string
  username: string
  slug: string
  email: string
  boughtStarterPack: boolean
  cScore: number
  unreadNotificationsCount: number
  retrievableEthers: Array<GenieRetrievableEthers>
  starknetWallet: GenieStarknetWallet
  hasTwoFactorAuthActivated: boolean
  profile: GenieProfile
}

export interface GenieSearchedUser {
  address?: string
  publicKey: string
  id: string
  slug: string
  isCurrentUser: boolean
}
