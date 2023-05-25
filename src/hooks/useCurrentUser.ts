import { shallow } from 'zustand/shallow'

import { useBoundStore } from 'src/zustand'

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
