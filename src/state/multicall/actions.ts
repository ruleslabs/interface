import { createAction } from '@reduxjs/toolkit'

import { Call } from './utils'
import { CallResultData } from './reducer'

export const addMulticallListeners = createAction<{ calls: Call[] }>('multicall/addMulticallListeners')
export const removeMulticallListeners = createAction<{ calls: Call[] }>('multicall/removeMulticallListeners')
export const fetchMulticallResults = createAction<{ fetchingBlockNumber: number; calls: Call[] }>(
  'multicall/fetchMulticallResults'
)
export const errorFetchingMulticallResults = createAction<{
  fetchingBlockNumber: number
  calls: Call[]
}>('multicall/errorFetchingMulticallResults')
export const updateMulticallResults = createAction<{
  blockNumber: number
  resultsData: { [key: string]: CallResultData }
}>('multicall/updateMulticallResults')
