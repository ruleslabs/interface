import { useBlockNumber } from '@/state/application/hooks'
import multicall from '@/lib/state/multicall'
import { SkipFirst } from '@types/tuple'

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
