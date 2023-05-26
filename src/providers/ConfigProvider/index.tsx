import { useEffect } from 'react'
import { shallow } from 'zustand/shallow'

import { useCurrentUser } from 'src/graphql/data/CurrentUser'
import { useBoundStore } from 'src/zustand'
import useInjectRulesWallet from 'src/hooks/useInjectRulesWallet'

interface RulesProviderProps {
  children: React.ReactNode
}

export default function ConfigProvider({ children }: RulesProviderProps) {
  const { data: currentUser, refresh } = useCurrentUser()
  const { setCurrentUser, setCurrentUserRefresher } = useBoundStore(
    (state) => ({ setCurrentUser: state.setCurrentUser, setCurrentUserRefresher: state.setCurrentUserRefresher }),
    shallow
  )

  useEffect(() => {
    console.log('new user set')
    setCurrentUser(currentUser)
    setCurrentUserRefresher(refresh)
  }, [currentUser, refresh])

  useInjectRulesWallet()

  return <>{children}</>
}
