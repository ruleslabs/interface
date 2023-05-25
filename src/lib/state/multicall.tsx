import { combineReducers, createStore } from 'redux'

import { createMulticall } from '@rulesorg/serum'
import { useMulticallContract } from 'src/hooks/useContract'
import { useBlockNumber } from 'src/state/application/hooks'

const multicall = createMulticall()
const reducer = combineReducers({ [multicall.reducerPath]: multicall.reducer })
export const store = createStore(reducer)

export default multicall

export function MulticallUpdater() {
  const latestBlockNumber = useBlockNumber()
  const contract = useMulticallContract()

  if (!latestBlockNumber || !contract) return null
  return <multicall.Updater latestBlockNumber={latestBlockNumber} contract={contract} />
}
