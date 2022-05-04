import { combineReducers, createStore } from 'redux'

import { createMulticall } from '@rulesorg/starknet-redux-multicall'
import { useMulticallContract } from '@/hooks/useContract'
import { useBlockNumber } from '@/state/application/hooks'

const multicall = createMulticall()
const reducer = combineReducers({ [multicall.reducerPath]: multicall.reducer })
export const store = createStore(reducer)

export default multicall

export function MulticallUpdater() {
  const latestBlockNumber = useBlockNumber()
  const contract = useMulticallContract()

  return <multicall.Updater latestBlockNumber={latestBlockNumber} contract={contract} />
}
