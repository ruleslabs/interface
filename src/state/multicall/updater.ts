import BN, { isBN } from 'bn.js'
import { useEffect, useMemo, useRef } from 'react'
import { Result, Contract, AbiEntry } from 'starknet'

import { CallResultData } from './reducer'
import { parseCallKey, toCallKey, Call, StructsAbi } from './utils'
import { errorFetchingMulticallResults, fetchMulticallResults, updateMulticallResults } from './actions'
import { useAppSelector, useAppDispatch } from '@/state/hooks'
import useDebounce from '@/hooks/useDebounce'
import { useBlockNumber } from '@/state/application/hooks'
import { AppState } from '@/state'
import { useMulticallContract } from '@/hooks/useContract'

const MAX_CALLS_PER_CHUNK = 50 // arbitray limit: discord.com/channels/793094838509764618/853954510515208192/955393106520461372

function chunkCalls(calls: Call[]): Call[][] {
  const maxCallsPerChunk = Math.ceil(calls.length / Math.ceil(calls.length / MAX_CALLS_PER_CHUNK))
  const chunks = []
  let current = []

  for (const call of calls) {
    current.push(call)
    if (current.length === maxCallsPerChunk) {
      chunks.push(current)
      current = []
    }
  }
  if (current.length) chunks.push(current)

  return chunks
}

async function fetchChunk(multicallContract: Contract, chunk: Call[]): Promise<Result> {
  try {
    return multicallContract.aggregate(
      chunk.reduce<(string | number)[]>((acc, call: Call) => {
        acc.push(...[call.address, call.selector, call.calldata.length])
        acc.push(...call.calldata)
        return acc
      }, [])
    )
  } catch (error) {
    console.error('Failed to fetch chunk', error)
    throw error
  }
}

function parseResponseField(
  responseIterator: Iterator<BN>,
  output: AbiEntry,
  structs: StructsAbi,
  parsedResult: CallResultData
): any {
  const { name, type } = output

  switch (true) {
    case /_len$/.test(name):
      return responseIterator.next().value.toNumber()

    case /\(felt/.test(type):
      return type.split(',').reduce<string[]>((acc) => {
        acc.push(responseIterator.next().value.toString())
        return acc
      }, [])

    case /\*/.test(type):
      const array = []
      const dereferencedType = type.replace('*', '')

      if (parsedResult[`${name}_len`]) {
        const arrayLenght = parsedResult[`${name}_len`] as number

        while (array.length < arrayLenght) {
          if (dereferencedType in structs) array.push(parseResponse(structs[type], structs, responseIterator))
          else array.push(responseIterator.next().value.toString())
        }
      } else if (parsedResult[`${name}_len`] === 0) {
        responseIterator.next()
      } else {
        throw 'Invalid ABI'
      }

      return array

    case type in structs:
      return parseResponse(structs[type], structs, responseIterator)

    default:
      return responseIterator.next().value.toString()
  }
}

function parseResponse(outputs: AbiEntry[], structs: StructsAbi, responseIterator: Iterator<BN>): CallResultData {
  const resultObject = outputs.flat().reduce((acc, output) => {
    acc[output.name] = parseResponseField(responseIterator, output, structs, acc)
    if (acc[output.name] && acc[`${output.name}_len`]) delete acc[`${output.name}_len`]

    return acc
  }, {} as CallResultData)

  return resultObject
  // return Object.entries(resultObject).reduce((acc, [key, value]) => {
  //   acc.push(value);
  //   acc[key] = value;
  //   return acc;
  // }, [] as Result);
}

function activeListeningKeys(callListeners: AppState['multicall']['callListeners']): string[] {
  return Object.keys(callListeners).filter((callKey: string) => {
    return callListeners[callKey] > 0
  })
}

function outdatedListeningKeys(
  callResults: AppState['multicall']['callResults'],
  listeningKeys: string[],
  latestBlockNumber?: number
): string[] {
  if (latestBlockNumber === undefined) return []

  return listeningKeys.filter((callKey: string) => {
    const result = callResults[callKey]
    // no data => outdated
    if (!result?.data) return true

    if ((result.fetchingBlockNumber ?? 0) >= latestBlockNumber || (result.blockNumber ?? 0) >= latestBlockNumber)
      return false

    return true
  })
}

export default function Updater(): null {
  const dispatch = useAppDispatch()
  const state = useAppSelector((state) => state.multicall)
  const multicallContract = useMulticallContract()
  // wait for listeners to settle before triggering updates
  const debouncedListeners = useDebounce(state.callListeners, 100)
  const latestBlockNumber = useBlockNumber()
  const cancellations = useRef<{ blockNumber: number; cancellations: Array<() => void> }>()

  const listeningKeys: string[] = useMemo(() => activeListeningKeys(debouncedListeners), [debouncedListeners])

  const outdatedCallKeys: string[] = useMemo(
    () => outdatedListeningKeys(state.callResults, listeningKeys, latestBlockNumber),
    [state.callResults, listeningKeys, latestBlockNumber]
  )

  const serializedOutdatedCallKeys: string = useMemo(() => JSON.stringify(outdatedCallKeys.sort()), [outdatedCallKeys])

  useEffect(() => {
    if (!multicallContract || !latestBlockNumber) return
    const outdatedCallKeys = JSON.parse(serializedOutdatedCallKeys)
    const calls = outdatedCallKeys.map(parseCallKey)

    const chunks = chunkCalls(calls)

    if (cancellations.current && cancellations.current.blockNumber !== latestBlockNumber) {
      cancellations.current.cancellations.forEach((cancel) => cancel())
    }

    dispatch(fetchMulticallResults({ fetchingBlockNumber: latestBlockNumber, calls }))

    cancellations.current = {
      blockNumber: latestBlockNumber,
      cancellations: chunks.map((chunk: Call[], index: number) => {
        let cancel: () => void = () => {}

        const promise = new Promise<Result[]>(async (resolve, reject) => {
          cancel = reject

          try {
            const result = await fetchChunk(multicallContract, chunk)
            resolve(result)
          } catch (error) {
            reject(error)
          }
        })

        promise
          .then((result) => {
            const [blockNumber, response] = result

            if (!Array.isArray(response) || !response.every(isBN)) {
              dispatch(
                errorFetchingMulticallResults({
                  calls: chunk,
                  fetchingBlockNumber: latestBlockNumber,
                })
              )
              return
            }

            const responseIterator = response[Symbol.iterator]()

            const results = chunk.reduce<{
              [callKey: string]: CallResultData
            }>((acc, call: Call) => {
              const callKey = toCallKey(call)
              const result = parseResponse(call.outputsAbi, call.structsAbi, responseIterator)

              acc[callKey] = result
              return acc
            }, {})

            if (Object.keys(results).length > 0)
              dispatch(updateMulticallResults({ resultsData: results, blockNumber: latestBlockNumber }))
          })
          .catch((error: any) => {
            console.error('Failed to fetch multicall chunk', chunk, error)
            dispatch(errorFetchingMulticallResults({ fetchingBlockNumber: latestBlockNumber, calls: chunk }))
          })

        return cancel
      }),
    }
  }, [latestBlockNumber, dispatch, serializedOutdatedCallKeys])

  return null
}
