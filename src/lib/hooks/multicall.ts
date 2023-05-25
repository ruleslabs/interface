import { useBlockNumber } from 'src/state/application/hooks'
import multicall from 'src/lib/state/multicall'
import { SkipFirst } from 'src/types/tuple'

type SkipFirstParam<T extends (...args: any) => any> = SkipFirst<Parameters<T>, 1>

export function useMultipleContractSingleData(
  ...args: SkipFirstParam<typeof multicall.hooks.useMultipleContractSingleData>
) {
  const { latestBlock } = useCallContext()
  return multicall.hooks.useMultipleContractSingleData(latestBlock, ...args)
}

function useCallContext() {
  const latestBlock = useBlockNumber()
  return { latestBlock }
}
