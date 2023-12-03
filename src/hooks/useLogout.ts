import { useCallback } from 'react'
import { redirect } from 'react-router-dom'
import { useRevokeSession } from 'src/graphql/data/Auth'
import { storeAccessToken } from 'src/utils/accessToken'

import useCurrentUser from './useCurrentUser'

export default function useLogout() {
  const [revokeSessionMutation, { loading, error }] = useRevokeSession()
  const { setCurrentUser } = useCurrentUser()

  const logout = useCallback(async () => {
    const { success } = await revokeSessionMutation({})
    if (!success) return

    setCurrentUser(null)
    storeAccessToken('')
    redirect('/')
  }, [revokeSessionMutation, redirect])

  return [logout, { loading, error }] as const
}
