import { shallow } from 'zustand/shallow'

import { useBoundStore } from '@/zustand'
import { UserSlice } from '@/zustand/user'

export default function useCurrentUser() {
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
