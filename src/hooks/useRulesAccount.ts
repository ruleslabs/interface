import { useMemo } from 'react'
import { RulesAccount } from 'src/lib/rulesWallet/RulesAccount'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import { RpcProvider } from 'starknet'

import useCurrentUser from './useCurrentUser'

function buildRulesAccount(address: string, oldAddress?: string): RulesAccount {
  // rulesSdk.starknet is not an instance of a vanilla starknet.js provider
  // then it is not supported by Account class and a default provider will be used
  const provider = new RpcProvider({ nodeUrl: rulesSdk.starknet.nodeUrl })

  return new RulesAccount(provider, address, '1', oldAddress)
}

export default function useRulesAccount() {
  const { currentUser } = useCurrentUser()

  return useMemo(() => {
    if (!currentUser) return {}

    const account = buildRulesAccount(currentUser.starknetWallet.address, currentUser.starknetWallet.oldAddress)

    return {
      account,
      needsSignerUpdate: account.needSignerUpdate,
      address: currentUser.starknetWallet.address,
      oldAddress: currentUser.starknetWallet.oldAddress,
    }
  }, [currentUser])
}
