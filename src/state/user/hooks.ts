import { gql, useMutation } from '@apollo/client'
import { useCallback, useEffect } from 'react'
import { SupportedLocale } from 'src/constants/locales'
import { AppState } from 'src/state'
import { useAppDispatch, useAppSelector } from 'src/state/hooks'

import { updateUserLocale } from './actions'

const SEARCH_USER_MUTATION = gql`
  mutation SearchUser($slug: String!) {
    searchUser(slug: $slug) {
      id
      username
      slug
      profile {
        pictureUrl(derivative: "width=320")
        fallbackUrl(derivative: "width=320")
      }
      starknetWallet {
        address
        publicKey
      }
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

    searchUserMutation({ variables: { slug: userSlug.toLowerCase() } })
  }, [userSlug])

  return { searchedUser: data?.searchUser, ...mutationStatus }
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
