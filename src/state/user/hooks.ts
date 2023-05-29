import { useCallback, useEffect } from 'react'
import { useMutation, gql } from '@apollo/client'

import { SupportedLocale } from 'src/constants/locales'
import { AppState } from 'src/state'
import { useAppSelector, useAppDispatch } from 'src/state/hooks'
import { updateUserLocale } from './actions'

const SEARCH_USER_MUTATION = gql`
  mutation SearchUser($slug: String!) {
    searchUser(slug: $slug) {
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
    }
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

export function useSearchUser(userSlug?: string) {
  const [searchUserMutation, { data, ...mutationStatus }] = useMutation(SEARCH_USER_MUTATION, { refetchQueries: [] })

  useEffect(() => {
    if (!userSlug) return

    searchUserMutation({ variables: { slug: userSlug } })
  }, [userSlug])

  return { searchedUser: data?.searchUser, ...mutationStatus }
}

export function useSetSocialLinksMutation() {
  return useMutation(SET_SOCIAL_LINKS_MUTATION)
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
