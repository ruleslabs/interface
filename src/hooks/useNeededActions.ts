import { useCurrentUser } from '@/state/user/hooks'

export default function useNeededActions() {
  const currentUser = useCurrentUser()

  const withdraw = currentUser?.retrievableEthers.length
  const upgrade = 1

  return { withdraw, upgrade, total: withdraw + upgrade }
}
