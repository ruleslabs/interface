import { useEffect, useCallback, useState } from 'react'
import { GetBlockResponse } from 'starknet'
import { useWeb3React } from '@web3-react/core'

import { useAppDispatch } from '@/state/hooks'
import { updateBlockNumber, updateEthereumBlockNumber } from './actions'
import { useStarknet } from '@/lib/starknet'
import useDebounce from '@/hooks/useDebounce'
import { BLOCK_POLLING } from '@/constants/misc'

function useBlockNumber() {
  const { provider } = useStarknet()
  const dispatch = useAppDispatch()

  const fetchBlock = useCallback(() => {
    if (!provider) return
    provider
      .getBlock('latest')
      .then((block: GetBlockResponse) => {
        dispatch(updateBlockNumber({ blockNumber: block.block_number }))
      })
      .catch((error) => {
        console.error('failed fetching block', error)
      })
  }, [provider, dispatch])

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
  return null
}
