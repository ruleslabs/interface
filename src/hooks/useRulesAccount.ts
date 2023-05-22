import { useMemo } from 'react'

import { RulesAccount } from '@/lib/rulesWallet/RulesAccount'
import { useAccount } from '@starknet-react/core'

export default function useRulesAccount() {
  const { account, ...rest } = useAccount()

  const rulesAccount = useMemo(() => {
    if (!(account instanceof RulesAccount)) return {}

    return { account, needsSignerUpdate: account.needSignerUpdate }
  }, [account])

  return { ...rulesAccount, ...rest }
}
