import { shallow } from 'zustand/shallow'

import { useBoundStore } from '@/zustand'
import { UserSlice } from '@/zustand/user'

export interface useCurrentUserReturnProps {
  currentUser: UserSlice['currentUser']
  setCurrentUser: UserSlice['setCurrentUser']
  refreshCurrentUser: UserSlice['currentUserRefresher']
}

export default function useCurrentUser(): useCurrentUserReturnProps {
  const { currentUser, setCurrentUser, refreshCurrentUser } = useBoundStore(
    (state) => ({
      currentUser: state.currentUser,
      setCurrentUser: state.setCurrentUser,
      refreshCurrentUser: state.currentUserRefresher,
    }),
    shallow
  )

  return { currentUser, setCurrentUser, refreshCurrentUser }
}
