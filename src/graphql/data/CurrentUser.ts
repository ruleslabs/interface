import gql from 'graphql-tag'
import { useCallback, useMemo } from 'react'
import { GenieCurrentUser } from 'src/types'

import { CurrentUser, useCurrentUserQuery } from './__generated__/types-and-hooks'

gql`
  query CurrentUser {
    currentUser {
      id
      username
      email
      slug
      unreadNotificationsCount
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
      }
    }
  }
`

function formatCurrentUserQueryData(queryCurrentUser: NonNullable<CurrentUser>): GenieCurrentUser | null {
  if (!queryCurrentUser) return null

  const queryStarknetWallet = queryCurrentUser.starknetWallet
  const queryProfile = queryCurrentUser.profile

  if (!queryStarknetWallet.rulesPrivateKey) throw 'No private key found on current user'

  return {
    id: queryCurrentUser.id,
    username: queryCurrentUser.username,
    slug: queryCurrentUser.slug,
    email: queryCurrentUser.email,
    unreadNotificationsCount: queryCurrentUser.unreadNotificationsCount,
    hasTwoFactorAuthActivated: queryCurrentUser.hasTwoFactorAuthActivated,
    retrievableEthers: queryCurrentUser.retrievableEthers,

    starknetWallet: {
      address: queryStarknetWallet.address,
      oldAddress: queryStarknetWallet.oldAddress,

      rulesPrivateKey: queryStarknetWallet.rulesPrivateKey,

      publicKey: queryStarknetWallet.publicKey,
      currentPublicKey: queryStarknetWallet.currentPublicKey,
      currentOldPublicKey: queryStarknetWallet.currentOldPublicKey,

      needsUpgrade: false,
      maintenance: false,
    },

    profile: {
      pictureUrl: queryProfile.pictureUrl,
      customAvatarUrl: queryProfile.customAvatarUrl,
      fallbackUrl: queryProfile.fallbackUrl,
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
