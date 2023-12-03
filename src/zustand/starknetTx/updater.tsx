import ms from 'ms.macro'
import { useCallback } from 'react'
import useInterval from 'src/hooks/useInterval'
import useIsWindowVisible from 'src/hooks/useIsWindowVisible'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import { shallow } from 'zustand/shallow'

import { useBoundStore } from '..'

const TX_STATUS_POLLING = ms`5s`

export default function StarknetTxUpdater(): null {
  const windowVisible = useIsWindowVisible()

  const { txAction, txHash, setTxHash, saveExecutedStx } = useBoundStore(
    (state) => ({
      txHash: state.stxHash,
      txAction: state.stxAction,
      setTxHash: state.stxSetHash,
      saveExecutedStx: state.saveExecutedStx,
    }),
    shallow
  )

  const fetchTxHashStatus = useCallback(async () => {
    if (!txHash) return

    // get starknet tx status
    const { execution_status: txStatus } = await rulesSdk.starknet.getTransactionReceipt(txHash)
    if (txStatus) {
      setTxHash(null)

      if (txAction) {
        saveExecutedStx({ hash: txHash, success: txStatus === 'SUCCEEDED', action: txAction })
      }
    }
  }, [txHash, txAction])

  useInterval(fetchTxHashStatus, windowVisible && txHash ? TX_STATUS_POLLING : null)

  return null
}
