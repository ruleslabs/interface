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
}

export interface GenieSearchedUser {
  address?: string
  publicKey: string
  id: string
  slug: string
  isCurrentUser: boolean
}
