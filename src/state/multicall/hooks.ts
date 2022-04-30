import { useMemo, useEffect } from 'react'
import { hash, Abi, FunctionAbi, RawArgs, stark } from 'starknet'

import { CallResultData } from '@/state/multicall/reducer'
import { useBlockNumber } from '@/state/application/hooks'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { toCallKey, parseCallKey, getStructsAbiFromAbiEntries, Call } from './utils'
import { removeMulticallListeners, addMulticallListeners } from './actions'

interface CallResult {
  data?: CallResultData
  valid: boolean
  blockNumber?: number
}

interface CallState {
  result?: CallResultData
  valid: boolean
  syncing: boolean
  loading: boolean
  error: boolean
}

const INVALID_CALL_STATE: CallState = { valid: false, syncing: false, loading: false, error: false }
const LOADING_CALL_STATE: CallState = { valid: true, syncing: true, loading: true, error: false }

function areCallInputsValid(callInputs?: RawArgs): callInputs is RawArgs {
  if (!callInputs) return false

  for (const key in Object.keys(callInputs)) {
    if (!callInputs[key]) return false
  }

  return true
}

function toCallState(callResult: CallResult, latestBlockNumber?: number): CallState {
  if (!callResult) return INVALID_CALL_STATE
  const { valid, data, blockNumber } = callResult
  if (!valid) return INVALID_CALL_STATE
  if (valid && !blockNumber) return LOADING_CALL_STATE
  if (!latestBlockNumber) return LOADING_CALL_STATE

  const syncing = (blockNumber ?? 0) < latestBlockNumber
  if (data && data !== {}) return { valid: true, loading: false, syncing, result: data, error: false }

  return { valid: true, loading: false, syncing, error: true }
}

function useCallsDataSubscription(calls: Array<Call | undefined>): CallResult[] {
  const callResults = useAppSelector((state) => state.multicall.callResults)
  const dispatch = useAppDispatch()

  const serializedCallKeys = useMemo(
    () =>
      JSON.stringify(
        calls
          ?.filter((c): c is Call => !!c)
          ?.map(toCallKey)
          ?.sort() ?? []
      ),
    []
  )

  useEffect(() => {
    const callKeys = JSON.parse(serializedCallKeys)
    const calls = callKeys.map(parseCallKey)
    if (!calls) return

    dispatch(addMulticallListeners({ calls }))

    return () => {
      dispatch(removeMulticallListeners({ calls }))
    }
  }, [serializedCallKeys, dispatch])

  return useMemo(
    () =>
      calls.map((call?: Call) => {
        if (!call) return { valid: false }

        const result = callResults[toCallKey(call)]
        let data
        if (result?.data && result?.data !== {}) data = result.data

        return { valid: true, data, blockNumber: result?.blockNumber }
      }),
    [calls, callResults]
  )
}

// export function useSingleContractMultipleData() {
//
// }

export function useMultipleContractSingleData(
  addresses: Array<string | undefined>,
  abi: Abi,
  methodName: string,
  callInputs?: RawArgs
): CallState[] {
  const functionInterface = useMemo(() => abi.find((abi) => abi.name === methodName) as FunctionAbi, [abi, methodName])
  const outputsAbi = functionInterface?.outputs
  const structsAbi = useMemo(() => getStructsAbiFromAbiEntries(abi, outputsAbi), [abi, outputsAbi])

  const selector = useMemo(() => hash.getSelectorFromName(methodName), [methodName])

  const calldata = useMemo(
    () => (areCallInputsValid(callInputs) ? stark.compileCalldata(callInputs) : undefined),
    [callInputs]
  )

  const calls = useMemo(
    () =>
      outputsAbi && selector && (addresses?.length ?? 0) > 0
        ? addresses.map<Call | undefined>((address) => {
            return address && calldata ? { address, selector, outputsAbi, structsAbi, calldata } : undefined
          })
        : [],
    [addresses, selector, calldata]
  )

  const callResults = useCallsDataSubscription(calls)

  const latestBlockNumber = useBlockNumber()

  return useMemo(
    () => callResults.map((result) => toCallState(result, latestBlockNumber)),
    [latestBlockNumber, callResults]
  )
}
