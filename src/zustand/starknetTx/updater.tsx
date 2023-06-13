import { useCallback } from 'react'
import ms from 'ms.macro'
import { shallow } from 'zustand/shallow'
import { TransactionStatus } from 'starknet'

import useInterval from 'src/hooks/useInterval'
import useIsWindowVisible from 'src/hooks/useIsWindowVisible'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import { useBoundStore } from '..'

const TX_STATUS_POLLING = ms`5s`

export default function StarknetTxUpdater(): null {
  const windowVisible = useIsWindowVisible()

  const { desc, txHash, setTxHash, saveExecutedStx } = useBoundStore(
    (state) => ({
      txHash: state.stxHash,
      desc: state.stxDesc,
      setTxHash: state.stxSetHash,
      saveExecutedStx: state.saveExecutedStx,
    }),
    shallow
  )

  const fetchTxHashStatus = useCallback(async () => {
    if (!txHash || !desc) return

    // get starknet tx status
    const { tx_status: txStatus } = await rulesSdk.starknet.getTransactionStatus(txHash)
    if (txStatus !== TransactionStatus.NOT_RECEIVED && txStatus !== TransactionStatus.RECEIVED) {
      setTxHash(null)
      saveExecutedStx({ hash: txHash, success: txStatus !== TransactionStatus.REJECTED, desc })
    }
  }, [txHash, desc])

  useInterval(fetchTxHashStatus, windowVisible && txHash ? TX_STATUS_POLLING : null)

  return null
}
