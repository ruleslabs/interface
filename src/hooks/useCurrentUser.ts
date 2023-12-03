import { useBoundStore } from 'src/zustand'
import { shallow } from 'zustand/shallow'

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

export function useNeedsSignerEscape() {
  const { currentUser } = useCurrentUser()

  return currentUser?.starknetWallet.publicKey !== currentUser?.starknetWallet.currentPublicKey
}

export function useNeedsOldSignerEscape() {
  const { currentUser } = useCurrentUser()

  return currentUser?.starknetWallet.publicKey !== currentUser?.starknetWallet.currentOldPublicKey
}

export function useMaintenance() {
  const { currentUser } = useCurrentUser()

  return currentUser?.starknetWallet.maintenance
}
