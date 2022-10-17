import { LATEST_ACCOUNT_VERSION } from '@rulesorg/sdk-core'

import { useCurrentUser } from '@/state/user/hooks'

export default function useNeededActions() {
  const currentUser = useCurrentUser()

  const withdraw = currentUser?.retrievableEthers.length
  const upgrade = +(currentUser?.starknetWallet.transactionVersion !== LATEST_ACCOUNT_VERSION)

  return { withdraw, upgrade, total: withdraw + upgrade }
}
