import { useBoundStore } from 'src/zustand'
import { shallow } from 'zustand/shallow'

export default function useSearchedUser() {
  const { user, setUser } = useBoundStore(
    (state) => ({ user: state.searchedUser, setUser: state.setSearchedUser }),
    shallow
  )

  return [user, setUser] as const
}
