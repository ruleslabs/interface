import useCurrentUser from 'src/hooks/useCurrentUser'

export default function useNeededActions() {
  const { currentUser } = useCurrentUser()

  const withdraw = currentUser?.retrievableEthers.length ?? 0
  const upgrade = currentUser?.starknetWallet.needsUpgrade ? 1 : 0

  return { withdraw, upgrade, total: withdraw + upgrade }
}
