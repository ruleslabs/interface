import { useEffect, useCallback } from 'react'
import { GetBlockResponse } from 'starknet'

import { useAppDispatch } from '@/state/hooks'
import { updateBlockNumber } from './actions'
import { useStarknet } from '@/starknet'

const BLOCK_POLLING = 5000 // 5s

export default function Updater(): null {
  const { library } = useStarknet()
  const dispatch = useAppDispatch()

  const fetchBlock = useCallback(() => {
    if (!library) return
    library
      .getBlock()
      .then((block: GetBlockResponse) => {
        dispatch(updateBlockNumber({ blockNumber: block.block_number }))
      })
      .catch(() => {
        console.error('failed fetching block')
      })
  }, [library, dispatch])

  useEffect(() => {
    fetchBlock() // first fetch

    const handler = setInterval(() => {
      fetchBlock()
    }, BLOCK_POLLING)

    return () => {
      clearInterval(handler)
    }
  }, [fetchBlock])

  return null
}
