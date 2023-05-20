import { useCallback, useEffect, useState } from 'react'
import { useQuery, useMutation, gql, ApolloError } from '@apollo/client'

import { SupportedLocale } from '@/constants/locales'
import { AppState } from '@/state'
import { useAppSelector, useAppDispatch } from '@/state/hooks'
import { updateUserLocale } from './actions'
import useCurrentUser from '@/hooks/useCurrentUser'

const SEARCH_USER_CONTENT = `
  id
  username
  slug
  cScore
  profile {
    pictureUrl(derivative: "width=320")
    fallbackUrl(derivative: "width=320")
    certified
    twitterUsername
    instagramUsername
    discordMember {
      username
      discriminator
    }
  }
  starknetWallet {
    address
    publicKey
  }
`

const SEARCH_USER_MUTATION = gql`
  mutation ($slug: String!) {
    searchUser(slug: $slug) { ${SEARCH_USER_CONTENT} }
  }
`

const SEARCH_USER_QUERY = gql`
  query ($slug: String!) {
    user(slug: $slug) { ${SEARCH_USER_CONTENT} }
  }
`

const SET_SOCIAL_LINKS_MUTATION = gql`
  mutation ($instagramUsername: String!, $twitterUsername: String!) {
    setSocialLinks(input: { instagramUsername: $instagramUsername, twitterUsername: $twitterUsername }) {
      twitterUsername
      instagramUsername
    }
  }
`

const CONNECT_DISCORD_ACCOUNT_MUTATION = gql`
  mutation ($code: String!, $redirectPath: String!) {
    connectDiscordAccount(input: { code: $code, redirectPath: $redirectPath }) {
      id
      username
      discriminator
    }
  }
`

const DISCONNECT_DISCORD_ACCOUNT_MUTATION = gql`
  mutation {
    disconnectDiscordAccount {
      discordId
    }
  }
`

const REFRESH_DISCORD_ROLES_MUTATION = gql`
  mutation {
    refreshDiscordRoles
  }
`

const SET_DISCORD_ACCOUNT_VISIBILITY_MUTATION = gql`
  mutation ($visible: Boolean!) {
    setDiscordAccountVisibility(visible: $visible) {
      visible
    }
  }
`

const EDIT_AVATAR_MUTATION = gql`
  mutation ($avatarId: Int!) {
    setAvatar(avatarId: $avatarId) {
      pictureUrl
    }
  }
`

const MARK_NOTIFICATIONS_AS_READ_MUTATION = gql`
  mutation {
    markNotificationsAsRead
  }
`

export function useSearchUser(userSlug?: string, skip = false) {
  const { currentUser } = useCurrentUser()

  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any | null>(null)

  const [searchUserMutation] = useMutation(SEARCH_USER_MUTATION)
  const {
    data: queryData,
    loading: queryLoading,
    error: queryError,
  } = useQuery(SEARCH_USER_QUERY, {
    variables: { slug: userSlug },
    skip: (!!currentUser && currentUser.slug !== userSlug) || !userSlug,
  })

  useEffect(() => {
    if (user || skip) return // no need to fetch user multiple times

    if (queryData) {
      setUser(queryData?.user ?? null)
      return
    }

    if (userSlug && !!currentUser && currentUser.slug !== userSlug)
      searchUserMutation({ variables: { slug: userSlug } })
        .then((res: any) => {
          setLoading(false)
          setUser(res?.data?.searchUser ?? null)
        })
        .catch((error: ApolloError) => {
          setError(true)
          setLoading(false)
          console.error(error)
        })
  }, [searchUserMutation, setUser, currentUser, userSlug, queryData])

  return currentUser ? { searchedUser: user, loading, error } : { searchedUser: user, queryLoading, queryError }
}

export function useSetSocialLinksMutation() {
  return useMutation(SET_SOCIAL_LINKS_MUTATION)
}

export function useSetDiscordVisibilityMutation() {
  return useMutation(SET_DISCORD_ACCOUNT_VISIBILITY_MUTATION)
}

export function useConnectDiscordAccountMutation() {
  return useMutation(CONNECT_DISCORD_ACCOUNT_MUTATION)
}

export function useDisconnectDiscordAccountMutation() {
  return useMutation(DISCONNECT_DISCORD_ACCOUNT_MUTATION)
}

export function useRefreshDiscordRolesMutation() {
  return useMutation(REFRESH_DISCORD_ROLES_MUTATION)
}

export function useEditAvatarMutation() {
  return useMutation(EDIT_AVATAR_MUTATION)
}

export function useMarkNotificationsAsReadMutation() {
  return useMutation(MARK_NOTIFICATIONS_AS_READ_MUTATION)
}

// Locales
export function useUserLocale(): AppState['user']['userLocale'] {
  return useAppSelector((state) => state.user.userLocale)
}

export function useUserLocaleManager(): [AppState['user']['userLocale'], (newLocale: SupportedLocale) => void] {
  const dispatch = useAppDispatch()
  const locale = useUserLocale()

  const setLocale = useCallback(
    (newLocale: SupportedLocale) => {
      dispatch(updateUserLocale({ userLocale: newLocale }))
    },
    [dispatch]
  )

  return [locale, setLocale]
}
