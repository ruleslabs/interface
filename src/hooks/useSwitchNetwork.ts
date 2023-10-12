import { useWeb3React } from '@web3-react/core'
import { useCallback } from 'react'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'

export function useSwitchL1Chain() {
  const { connector } = useWeb3React()

  return useCallback(() => {
    connector.activate(rulesSdk.networkInfos.ethereumChainId)
  }, [connector])
}
