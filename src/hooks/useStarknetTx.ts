import { useCallback, useMemo, useState } from 'react'
import { shallow } from 'zustand/shallow'

import { useBoundStore } from 'src/zustand'
import { WeiAmount } from '@rulesorg/sdk-core'
import { ParsedNetworkFee } from 'src/types/starknetTx'
import useRulesAccount from './useRulesAccount'

export function useEstimateFees() {
  const [parsedNetworkFee, setParsedNetworkFee] = useState<ParsedNetworkFee | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { calls, txValue } = useBoundStore((state) => ({ calls: state.stxCalls, txValue: state.stxValue }), shallow)

  const { account } = useRulesAccount()

  const estimatedFees = useCallback(async () => {
    if (!calls.length || !account) return

    setLoading(true)
    setError(null)

    try {
      const estimatedFees = await account.estimateInvokeFee(calls)

      const maxFee = estimatedFees.suggestedMaxFee?.toString() ?? '0'
      const fee = estimatedFees.overall_fee.toString() ?? '0'
      if (!+maxFee || !+fee) {
        throw new Error('Failed to estimate fees')
      }

      setParsedNetworkFee({ maxFee: WeiAmount.fromRawAmount(maxFee), fee: WeiAmount.fromRawAmount(fee) })
    } catch (error) {
      setError(error?.message ?? 'Unkown error')
    }

    setLoading(false)
  }, [account, calls])

  const parsedTotalCost = useMemo(() => {
    if (!parsedNetworkFee) return null

    return {
      cost: txValue.add(parsedNetworkFee.fee),
      maxCost: txValue.add(parsedNetworkFee.maxFee),
    }
  }, [txValue, parsedNetworkFee?.maxFee])

  const data = {
    parsedNetworkFee,
    parsedTotalCost,
  }

  return [estimatedFees, { data, loading, error }] as const
}

export function useExecuteTx() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { calls, txHash, setTxHash } = useBoundStore(
    (state) => ({ calls: state.stxCalls, txHash: state.stxHash, setTxHash: state.stxSetHash }),
    shallow
  )

  const { account } = useRulesAccount()

  const executeTx = useCallback(
    async (parsedMaxFee: WeiAmount) => {
      if (!calls.length || !account) return

      setLoading(true)
      setError(null)

      const maxFee = parsedMaxFee.quotient.toString()

      try {
        const tx = await account.execute(calls, undefined, { maxFee })
        if (!tx.transaction_hash) throw 'Failed to push transaction on starknet'

        setTxHash(tx.transaction_hash)
      } catch (error) {
        setError(error?.message ?? 'Unkown error')
      }

      setLoading(false)
    },
    [account, calls]
  )

  return [executeTx, { data: { txHash }, loading, error }] as const
}

export default function useStarknetTx() {
  return useBoundStore(
    (state) => ({
      setCalls: state.stxSetCalls,
      pushCalls: state.stxPushCalls,
      resetStarknetTx: state.stxResetStarknetTx,
      txValue: state.stxValue,
      increaseTxValue: state.stxIncreaseValue,
      setSigning: state.stxSetSigning,
      signing: state.stxSigning,
      txHash: state.stxHash,
    }),
    shallow
  )
}
