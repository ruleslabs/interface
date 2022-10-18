import { useCurrentUser } from '@/state/user/hooks'

export default function useNeededActions() {
  const currentUser = useCurrentUser()

  const withdraw = currentUser?.retrievableEthers.length
  const upgrade = +currentUser?.starknetWallet.needsUpgrade

  return { withdraw, upgrade, total: withdraw + upgrade }
}
