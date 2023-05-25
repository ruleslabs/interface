import { useEffect } from 'react'
import { shallow } from 'zustand/shallow'

import { useCurrentUser } from 'src/graphql/data/CurrentUser'
import { useBoundStore } from 'src/zustand'
import useInjectRulesWallet from 'src/hooks/useInjectRulesWallet'
import { gql, useQuery } from '@apollo/client'

const TEST = gql`
  query {
    currentUser {
      id
    }
  }
`

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
    setCurrentUser(currentUser)
    setCurrentUserRefresher(refresh)
  }, [!!currentUser, refresh])

  useInjectRulesWallet()

  const { data } = useQuery(TEST)
  console.log(data)

  return <>{children}</>
}
