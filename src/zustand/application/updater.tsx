import { useCallback } from 'react'
import ms from 'ms.macro'
import { shallow } from 'zustand/shallow'

import useInterval from 'src/hooks/useInterval'
import useIsWindowVisible from 'src/hooks/useIsWindowVisible'
import { useBoundStore } from '..'
import {
  StarknetTransactionStatus,
  useStarknetTransactionLazyQuery,
} from 'src/graphql/data/__generated__/types-and-hooks'

const PENDING_OPERATION_POLLING = ms`10s`

export default function StarknetTxUpdater(): null {
  const windowVisible = useIsWindowVisible()

  // query pending operation status
  const [fetchGqlStx] = useStarknetTransactionLazyQuery()

  const { executedStxs, pendingOperations, unsubscribeFromPendingOperation } = useBoundStore(
    (state) => ({
      executedStxs: state.executedStxs,
      pendingOperations: state.pendingOperations,
      unsubscribeFromPendingOperation: state.unsubscribeFromPendingOperation,
    }),
    shallow
  )

  const fetchTxHashStatus = useCallback(async () => {
    for (const tokenId in pendingOperations) {
      for (const pendingOperationTxHash in pendingOperations[tokenId]) {
        // if txHash has been accepted on
        for (const executedStx of executedStxs) {
          if (executedStx.hash === pendingOperationTxHash) {
            if (executedStx.success) {
              // Successfull pending operation: we check status on rules
              // Failed pending operation: we just unsubscribe from it

              const { data } = await fetchGqlStx({
                variables: { hash: pendingOperationTxHash },
                fetchPolicy: 'no-cache',
              })
              const status = data?.starknetTransaction?.status

              if (!status || status === StarknetTransactionStatus.Received) break
            }

            unsubscribeFromPendingOperation(pendingOperationTxHash)
            break
          }
        }
      }
    }
  }, [executedStxs.length, pendingOperations])

  useInterval(
    fetchTxHashStatus,
    windowVisible && Object.keys(pendingOperations).length ? PENDING_OPERATION_POLLING : null
  )

  return null
}
