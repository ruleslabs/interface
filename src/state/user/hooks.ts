import { useCallback } from 'react'
import { useQuery, gql } from '@apollo/client'

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

export function useQueryCurrentUser(skip = false) {
  const dispatch = useAppDispatch()

  const { data: currentUserData, loading, error } = useQuery(CURRENT_USER_QUERY, { skip })
  const currentUser = currentUserData?.currentUser

  return useCallback(async () => {
    try {
      const response = await getApolloClient()?.query({ query: CURRENT_USER_QUERY })
      dispatch(setCurrentUser({ user: response?.data?.currentUser ?? null }))
      console.log(response)

      return response?.data?.currentUser
    } catch {
      dispatch(setCurrentUser({ user: null }))

      return null
    }
  }, [dispatch, setCurrentUser, getApolloClient])
}
