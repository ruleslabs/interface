import { useEffect, useCallback, useState } from 'react'
import { useWeb3React } from '@web3-react/core'

import { useAppDispatch } from 'src/state/hooks'
import { updateEtherPrice, updateBlockNumber, updateEthereumBlockNumber } from './actions'
import useDebounce from 'src/hooks/useDebounce'
import { BLOCK_POLLING, ETH_PRICE_POLLING } from 'src/constants/misc'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'

export function useEtherEURPrice() {
  const dispatch = useAppDispatch()

  const fetchEthPrice = useCallback(
    () =>
      fetch('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=EUR')
        .then((res) => res.json())
        .then((res: any) => {
          const amount = res?.EUR

          dispatch(updateEtherPrice({ price: !!amount ? +amount : undefined }))
        })
        .catch((err) => console.error(err)),
    [dispatch]
  )

  useEffect(() => {
    fetchEthPrice()

    const handler = setInterval(() => {
      fetchEthPrice()
    }, ETH_PRICE_POLLING)

    return () => {
      clearInterval(handler)
    }
  }, [fetchEthPrice])
}

function useBlockNumber() {
  const dispatch = useAppDispatch()

  const fetchBlock = useCallback(async () => {
    const block = await rulesSdk.starknet.getBlock('latest')
    dispatch(updateBlockNumber({ blockNumber: block.block_number }))
  }, [rulesSdk.starknet, dispatch])

  useEffect(() => {
    fetchBlock() // first fetch

    const handler = setInterval(() => {
      fetchBlock()
    }, BLOCK_POLLING)

    return () => {
      clearInterval(handler)
    }
  }, [fetchBlock])
}

function useEthereumBlockNumber() {
  const { provider, chainId } = useWeb3React()
  const dispatch = useAppDispatch()

  const [state, setState] = useState<{ chainId: number | undefined; blockNumber: number | null }>({
    chainId,
    blockNumber: null,
  })

  const handleBlockNumber = useCallback(
    (blockNumber: number) => {
      setState((state) => {
        if (chainId === state.chainId) {
          if (typeof state.blockNumber !== 'number') return { chainId, blockNumber }
          return { chainId, blockNumber: Math.max(blockNumber, state.blockNumber) }
        }
        return state
      })
    },
    [chainId, setState]
  )

  // attach/detach listeners
  useEffect(() => {
    if (!provider || !chainId) return undefined

    setState({ chainId, blockNumber: null })

    provider
      .getBlockNumber()
      .then(handleBlockNumber)
      .catch((error) => console.error(`Failed to get block number for chainId: ${chainId}`, error))

    provider.on('block', handleBlockNumber)
    return () => {
      provider.removeListener('block', handleBlockNumber)
    }
  }, [chainId, dispatch, provider, handleBlockNumber])

  const debouncedState = useDebounce(state, 100)

  useEffect(() => {
    if (!debouncedState.blockNumber || !debouncedState.chainId) return
    dispatch(updateEthereumBlockNumber({ chainId: debouncedState.chainId, blockNumber: debouncedState.blockNumber }))
  }, [dispatch, debouncedState.blockNumber, debouncedState.chainId])
}

export default function Updater(): null {
  useBlockNumber()
  useEthereumBlockNumber()
  useEtherEURPrice()
  return null
}
