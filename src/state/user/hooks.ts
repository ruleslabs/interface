import { useCallback, useEffect, useState } from 'react'
import { useQuery, useMutation, gql, ApolloError } from '@apollo/client'

import { getApolloClient } from '@/apollo/apollo'
import { useAppSelector, useAppDispatch } from '@/state/hooks'
import { setCurrentUser } from './actions'

const CURRENT_USER_QUERY = gql`
  query {
    currentUser {
      username
      email
      slug
      starknetAddress
      rulesPrivateKey {
        salt
        iv
        encryptedPrivateKey
      }
      profile {
        twitterUsername
        instagramUsername
        discordId
      }
    }
  }
`

const SEARCH_USER_CONTENT = `
  id
  username
  profile {
    pictureUrl(derivative: "width=320")
    certified
    twitterUsername
    instagramUsername
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

const EDIT_PROFILE_MUTATION = gql`
  mutation ($instagramUsername: String!, $twitterUsername: String!) {
    editProfile(input: { instagramUsername: $instagramUsername, twitterUsername: $twitterUsername }) {
      twitterUsername
      instagramUsername
    }
  }
`

const CONNECT_DISCORD_ACCOUNT_MUTATION = gql`
  mutation ($code: String!) {
    connectDiscordAccount(code: $code) {
      discordId
      discordUsername
      discordDiscriminator
    }
  }
`

export function useRemoveCurrentUser() {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setCurrentUser({ user: null })), [dispatch, setCurrentUser])
}

export function useCurrentUser() {
  const currentUser = useAppSelector((state) => state.user.currentUser)
  return currentUser
}

// export function useSetCurrentUser() {
//   const dispatch = useAppDispatch()
//   return useCallback((user: any) => dispatch(setCurrentUser({ user })), [dispatch, setCurrentUser])
// }

export function useQueryCurrentUser(skip = false) {
  const dispatch = useAppDispatch()

  return useCallback(async () => {
    try {
      const response = await getApolloClient()?.query({ query: CURRENT_USER_QUERY })
      dispatch(setCurrentUser({ user: response?.data?.currentUser ?? null }))

      return response?.data?.currentUser
    } catch {
      dispatch(setCurrentUser({ user: null }))

      return null
    }
  }, [dispatch, setCurrentUser, getApolloClient])
}

export function useSearchUser(userSlug?: string) {
  const currentUser = useAppSelector((state) => state.user.currentUser)

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
    if (user) return // no need to fetch user multiple times

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

  return currentUser ? { user, loading, error } : { user, queryLoading, queryError }
}

export function useEditProfileMutation() {
  return useMutation(EDIT_PROFILE_MUTATION)
}

export function useConnectDiscordAccountMutation() {
  return useMutation(CONNECT_DISCORD_ACCOUNT_MUTATION)
}
