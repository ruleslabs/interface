import { useCallback, useMemo } from 'react'
import gql from 'graphql-tag'

import { GenieCurrentUser, GenieProfile } from 'src/types'
import { CurrentUser, useCurrentUserQuery } from './__generated__/types-and-hooks'
import { constants } from '@rulesorg/sdk-core'

gql`
  query CurrentUser {
    currentUser {
      id
      username
      email
      slug
      boughtStarterPack
      cScore
      unreadNotificationsCount
      retrievableEthers {
        amount
        l1Recipient
      }
      starknetWallet {
        address
        oldAddress
        deployed
        publicKey
        signerEscapeTriggeredAt
        lockingReason
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
    }
  }

  return {
    id: queryCurrentUser.id,
    username: queryCurrentUser.username,
    slug: queryCurrentUser.slug,
    email: queryCurrentUser.email,
    boughtStarterPack: queryCurrentUser.boughtStarterPack,
    cScore: queryCurrentUser.cScore,
    unreadNotificationsCount: queryCurrentUser.unreadNotificationsCount,
    hasTwoFactorAuthActivated: queryCurrentUser.hasTwoFactorAuthActivated,
    retrievableEthers: queryCurrentUser.retrievableEthers,

    starknetWallet: {
      address: queryStarknetWallet.address,
      oldAddress: queryStarknetWallet.oldAddress,
      publicKey: queryStarknetWallet.publicKey,
      deployed: queryStarknetWallet.deployed,
      // cannot do better with how bad enums are handled in graphql
      lockingReason: queryStarknetWallet.lockingReason as any as constants.StarknetWalletLockingReason,
      needsUpgrade: false,
      rulesPrivateKey: queryStarknetWallet.rulesPrivateKey,
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
