import { useEffect } from 'react'
import { shallow } from 'zustand/shallow'

import { useCurrentUser } from '@/graphql/data/CurrentUser'
import { useBoundStore } from '@/zustand'
import useInjectRulesWallet from '@/hooks/useInjectRulesWallet'

interface RulesProviderProps {
  children: React.ReactNode
}

export default function RulesProvider({ children }: RulesProviderProps) {
  const { data: currentUser, loading, refresh } = useCurrentUser()
  const { setCurrentUser, setCurrentUserRefresher } = useBoundStore(
    (state) => ({ setCurrentUser: state.setCurrentUser, setCurrentUserRefresher: state.setCurrentUserRefresher }),
    shallow
  )

  useEffect(() => {
    setCurrentUser(currentUser)
    setCurrentUserRefresher(refresh)
  }, [setCurrentUser, currentUser, refresh])

  useInjectRulesWallet()

  if (loading) return null

  return <>{children}</>
}