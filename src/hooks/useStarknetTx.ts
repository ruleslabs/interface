import { useCallback, useMemo, useState } from 'react'
import { shallow } from 'zustand/shallow'
import { DeployContractResponse, EstimateFee, InvokeFunctionResponse } from 'starknet'

import { useBoundStore } from 'src/zustand'
import { Unit, WeiAmount } from '@rulesorg/sdk-core'
import { ParsedNetworkFee, StxAction } from 'src/types/starknetTx'
import useRulesAccount from './useRulesAccount'
import { ExecutedOrPendingTx } from 'src/types'

export function useEstimateFees() {
  const [parsedNetworkFee, setParsedNetworkFee] = useState<ParsedNetworkFee | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { calls, accountDeploymentPayload, txValue, migration } = useBoundStore(
    (state) => ({
      calls: state.stxCalls,
      accountDeploymentPayload: state.stxAccountDeploymentPayload,
      txValue: state.stxValue,
      migration: state.stxMigration,
    }),
    shallow
  )

  const { account } = useRulesAccount()

  const estimatedFees = useCallback(
    async (privateKey?: string) => {
      const stxAccount = migration ? account?.old : account
      if (!stxAccount) return

      if (privateKey) {
        stxAccount.updateSigner(privateKey)
      }

      setLoading(true)
      setError(null)

      try {
        let estimatedFees: EstimateFee | undefined

        if (accountDeploymentPayload) {
          estimatedFees = await stxAccount.estimateAccountDeployFee(accountDeploymentPayload)
        } else {
          estimatedFees = await stxAccount.estimateFee(calls)
        }

        const maxFee = estimatedFees.suggestedMaxFee.toString() ?? '0'
        const fee = estimatedFees.overall_fee.toString() ?? '0'
        const gasPrice = +(estimatedFees.gas_price?.toString() ?? '0')
        if (!+maxFee || !+fee || !gasPrice) {
          throw new Error('Failed to estimate fees')
        }

        setParsedNetworkFee({
          maxFee: WeiAmount.fromRawAmount(maxFee),
          fee: WeiAmount.fromRawAmount(fee),
          gasPrice,
        })
      } catch (error) {
        setError(error?.message ?? 'Unkown error')
      }

      setLoading(false)
    },
    [account, calls, accountDeploymentPayload, migration]
  )

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
    gasPrice: parsedNetworkFee?.gasPrice,
  }

  return [estimatedFees, { data, loading, error }] as const
}

export function useExecuteTx() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { calls, accountDeploymentPayload, txHash, setTxHash, migration, beforeExecutionCallback } = useBoundStore(
    (state) => ({
      calls: state.stxCalls,
      txHash: state.stxHash,
      setTxHash: state.stxSetHash,
      accountDeploymentPayload: state.stxAccountDeploymentPayload,
      migration: state.stxMigration,
      beforeExecutionCallback: state.stxBeforeExecutionCallback,
    }),
    shallow
  )

  const { account } = useRulesAccount()

  const executeTx = useCallback(
    async (parsedMaxFee: WeiAmount, action: StxAction, privateKey?: string) => {
      const stxAccount = migration ? account?.old : account
      if (!stxAccount) return

      if (privateKey) {
        stxAccount.updateSigner(privateKey)
      }

      setLoading(true)
      setError(null)

      const maxFee = parsedMaxFee.toUnitFixed(Unit.WEI)

      const stxCalls = beforeExecutionCallback
        ? await beforeExecutionCallback(JSON.parse(JSON.stringify(calls)), maxFee)
        : calls

      try {
        let tx: InvokeFunctionResponse | DeployContractResponse | undefined

        if (accountDeploymentPayload) {
          tx = await stxAccount.deployAccount(accountDeploymentPayload)
        } else {
          tx = await stxAccount.execute(stxCalls, undefined, { maxFee })
        }

        if (!tx.transaction_hash) throw 'Failed to push transaction on starknet'

        setTxHash(tx.transaction_hash, action)
      } catch (error) {
        setError(error?.message ?? 'Unkown error')
      }

      setLoading(false)
    },
    [account, calls, accountDeploymentPayload, migration, beforeExecutionCallback]
  )

  return [executeTx, { data: { txHash }, loading, error }] as const
}

export default function useStarknetTx() {
  return useBoundStore(
    (state) => ({
      setCalls: state.stxSetCalls,
      pushCalls: state.stxPushCalls,

      setAccountDeploymentPayload: state.stxSetAccountDeploymentPayload,

      resetStarknetTx: state.stxResetStarknetTx,

      txValue: state.stxValue,
      increaseTxValue: state.stxIncreaseValue,

      setSigning: state.stxSetSigning,
      signing: state.stxSigning,

      txHash: state.stxHash,

      migration: state.stxMigration,
      setMigration: state.stxSetMigration,

      setBeforeExecutionCallback: state.stxSetBeforeExecutionCallback,
    }),
    shallow
  )
}

export function useStxHistory() {
  const { txAction, txHash, executedTxs } = useBoundStore(
    (state) => ({
      txAction: state.stxAction,
      txHash: state.stxHash,
      executedTxs: state.executedStxs,
    }),
    shallow
  )

  return useMemo(() => {
    const receivedTxs = txHash ? [{ hash: txHash, action: txAction, loading: true }] : []

    return [...receivedTxs, ...executedTxs.filter((tx) => !!tx.action)] as ExecutedOrPendingTx[]
  }, [executedTxs.length, txHash, txAction])
}
