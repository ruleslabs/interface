import { useCallback, useMemo } from 'react'
import gql from 'graphql-tag'

import { GenieCurrentUser, GenieProfile } from 'src/types'
import { CurrentUser, useCurrentUserQuery } from './__generated__/types-and-hooks'

gql`
  query CurrentUser {
    currentUser {
      id
      username
      email
      slug
      boughtStarterPack
      cScore
      rank
      unreadNotificationsCount
      badges {
        type
        level
        quantity
      }
      retrievableEthers {
        amount
        l1Recipient
      }
      starknetWallet {
        address
        oldAddress
        publicKey
        currentPublicKey
        currentOldPublicKey
        maintenance
        rulesPrivateKey {
          salt
          iv
          encryptedPrivateKey
        }
      }
      hasTwoFactorAuthActivated
      profile {
        pictureUrl(derivative: "width=320")
        customAvatarUrl(derivative: "width=320")
        fallbackUrl(derivative: "width=320")
        twitterUsername
        instagramUsername
        isDiscordVisible
        certified
        discordMember {
          id
          username
          discriminator
          avatarUrl(derivative: "width=320")
          guildAvatarUrl(derivative: "width=320")
        }
      }
    }
  }
`

export function formatCurrentUserQueryData(queryCurrentUser: NonNullable<CurrentUser>): GenieCurrentUser | null {
  if (!queryCurrentUser) return null

  const queryStarknetWallet = queryCurrentUser.starknetWallet
  const queryProfile = queryCurrentUser.profile

  if (!queryStarknetWallet.rulesPrivateKey) throw 'No private key found on current user'

  let discordMember: GenieProfile['discordMember']
  if (queryProfile.discordMember) {
    discordMember = {
      username: queryProfile.discordMember.username ?? '',
      discriminator: queryProfile.discordMember.discriminator ?? '',
      avatarUrl: queryProfile.discordMember.guildAvatarUrl ?? queryProfile.discordMember.avatarUrl,
      id: queryProfile.discordMember.id ?? '',
    }
  }

  return {
    id: queryCurrentUser.id,
    username: queryCurrentUser.username,
    slug: queryCurrentUser.slug,
    email: queryCurrentUser.email,
    boughtStarterPack: queryCurrentUser.boughtStarterPack,
    cScore: queryCurrentUser.cScore,
    rank: queryCurrentUser.rank,
    unreadNotificationsCount: queryCurrentUser.unreadNotificationsCount,
    hasTwoFactorAuthActivated: queryCurrentUser.hasTwoFactorAuthActivated,
    retrievableEthers: queryCurrentUser.retrievableEthers,

    badges: queryCurrentUser.badges.map(({ level, quantity, type }) => ({
      level,
      type,
      quantity: quantity ?? 1,
    })),

    starknetWallet: {
      address: queryStarknetWallet.address,
      oldAddress: queryStarknetWallet.oldAddress,

      rulesPrivateKey: queryStarknetWallet.rulesPrivateKey,

      publicKey: queryStarknetWallet.publicKey,
      currentPublicKey: queryStarknetWallet.currentPublicKey,
      currentOldPublicKey: queryStarknetWallet.currentOldPublicKey,

      maintenance: queryStarknetWallet.maintenance,
      needsUpgrade: false,
    },

    profile: {
      pictureUrl: queryProfile.pictureUrl,
      customAvatarUrl: queryProfile.customAvatarUrl,
      fallbackUrl: queryProfile.fallbackUrl,
      twitterUsername: queryProfile.twitterUsername,
      instagramUsername: queryProfile.instagramUsername,
      isDiscordVisible: queryProfile.isDiscordVisible,
      certified: queryProfile.certified,
      discordMember,
    },
  }
}

export function useCurrentUser() {
  const { data: queryData, loading, fetchMore } = useCurrentUserQuery()

  const refresh = useCallback(() => {
    fetchMore({})
  }, [fetchMore])

  const queryCurrentUser = queryData?.currentUser as NonNullable<CurrentUser>
  return useMemo(() => {
    return {
      data: formatCurrentUserQueryData(queryCurrentUser),
      refresh,
      loading,
    }
  }, [loading, queryCurrentUser])
}
