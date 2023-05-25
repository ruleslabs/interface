import { MutationFunction } from '@apollo/client'
import { constants } from '@rulesorg/sdk-core'

export type GenieError = { message: string; id: string | null; render: () => React.ReactNode } | null

export interface GenieStatus {
  loading: boolean
  error?: GenieError
}

export type FormatedMutationFunction<TData, TVariables, TFormatedData> = (
  options: Parameters<MutationFunction<TData, TVariables>>[0]
) => Promise<NonNullable<TFormatedData>>

export interface GenieRetrievableEthers {
  amount: string
  l1Recipient: string
}

export interface GenieStarknetWallet {
  address?: string
  publicKey: string
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

export type ModalContents<TEnum extends string | number | symbol> = {
  [key in TEnum]: {
    Component: () => JSX.Element
    title?: string
    previous?: TEnum
  }
}
