import { useCallback } from 'react'
import { useRouter } from 'next/router'

import useCurrentUser from './useCurrentUser'
import { storeAccessToken } from '@/utils/accessToken'
import { useRevokeSession } from '@/graphql/data/Auth'

export default function useLogout() {
  // router
  const router = useRouter()

  const [revokeSessionMutation, { loading, error }] = useRevokeSession()
  const { setCurrentUser } = useCurrentUser()

  const logout = useCallback(async () => {
    const { success } = await revokeSessionMutation({})
    if (!success) return

    setCurrentUser(null)
    storeAccessToken('')
    router.replace('/')
  }, [revokeSessionMutation])

  return [logout, { loading, error }] as const
}
