import { useCallback } from 'react'
import ms from 'ms.macro'

import useInterval from 'src/hooks/useInterval'
import useIsWindowVisible from 'src/hooks/useIsWindowVisible'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import { useBoundStore } from '..'
import { TransactionStatus } from 'starknet'

const TX_STATUS_POLLING = ms`5s`

export default function StarknetTxUpdater(): null {
  const windowVisible = useIsWindowVisible()

  const { txHash, setTxHash } = useBoundStore((state) => ({ txHash: state.stxHash, setTxHash: state.stxSetHash }))

  const fetchTxHashStatus = useCallback(async () => {
    if (!txHash) return

    // get starknet tx status
    const { tx_status: txStatus } = await rulesSdk.starknet.getTransactionStatus(txHash)
    if (txStatus !== TransactionStatus.NOT_RECEIVED && txStatus !== TransactionStatus.RECEIVED) {
      setTxHash(null)
    }
  }, [txHash])

  useInterval(fetchTxHashStatus, windowVisible && txHash ? TX_STATUS_POLLING : null)

  return null
}
