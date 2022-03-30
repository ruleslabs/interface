import { createReducer } from '@reduxjs/toolkit'

import { toCallKey } from './utils'
import {
  addMulticallListeners,
  removeMulticallListeners,
  fetchMulticallResults,
  errorFetchingMulticallResults,
  updateMulticallResults,
} from './actions'

export interface CallResultData {
  [key: string]: string | string[] | number | CallResultData
}

export interface MulticallState {
  callListeners: {
    // Store the number of listeners per call
    [callKey: string]: number
  }
  callResults: {
    [callKey: string]: {
      data?: CallResultData | null
      blockNumber?: number
      fetchingBlockNumber?: number
    }
  }
}

export const initialState: MulticallState = {
  callListeners: {},
  callResults: {},
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(addMulticallListeners, (state, { payload: { calls } }) => {
      const listeners = state.callListeners

      calls.forEach((call) => {
        const callKey = toCallKey(call)
        listeners[callKey] = (listeners[callKey] ?? 0) + 1
      })
    })
    .addCase(removeMulticallListeners, (state, { payload: { calls } }) => {
      const listeners = state.callListeners

      calls.forEach((call) => {
        const callKey = toCallKey(call)
        if (!listeners[callKey]) return

        if (--listeners[callKey] <= 0) delete listeners[callKey]
      })
    })
    .addCase(fetchMulticallResults, (state, { payload: { fetchingBlockNumber, calls } }) => {
      const results = state.callResults

      calls.forEach((call) => {
        const callKey = toCallKey(call)
        results[callKey] = results[callKey] ?? { fetchingBlockNumber }
        if ((results[callKey]?.fetchingBlockNumber ?? 0) >= fetchingBlockNumber) return
        results[callKey].fetchingBlockNumber = fetchingBlockNumber
      })
    })
    .addCase(errorFetchingMulticallResults, (state, { payload: { fetchingBlockNumber, calls } }) => {
      const results = state.callResults

      calls.forEach((call) => {
        const callKey = toCallKey(call)
        if (typeof results[callKey]?.fetchingBlockNumber !== 'number') return
        if ((results[callKey]?.fetchingBlockNumber ?? 0) > fetchingBlockNumber) return

        results[callKey] = {
          data: null,
          blockNumber: fetchingBlockNumber,
        }
      })
    })
    .addCase(updateMulticallResults, (state, { payload: { blockNumber, resultsData } }) => {
      const results = state.callResults

      Object.keys(resultsData).forEach((callKey: string) => {
        results[callKey] = results[callKey] ?? {}
        if ((results[callKey].blockNumber ?? 0) >= blockNumber) return

        results[callKey] = {
          data: resultsData[callKey] ?? null,
          blockNumber,
        }
      })
    })
)
