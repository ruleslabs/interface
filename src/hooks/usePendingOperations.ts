import { useMemo } from 'react'
import { useBoundStore } from 'src/zustand'
import { shallow } from 'zustand/shallow'

export function usePendingOperations(tokenId?: string) {
  const pendingOperations = useBoundStore((state) => state.pendingOperations, shallow)
  const tokenPendingOperations = pendingOperations[tokenId ?? ''] ?? []

  return useMemo(
    () => Object.keys(tokenPendingOperations).map((txHash) => tokenPendingOperations[txHash]),
    [JSON.stringify(tokenPendingOperations)]
  )
}

export function useOperations() {
  const { cleanOperations, pushOperation } = useBoundStore(
    (state) => ({
      pendingOperations: state.pendingOperations,
      pushOperation: state.pushOperation,
      cleanOperations: state.cleanOperations,
    }),
    shallow
  )

  return { cleanOperations, pushOperation }
}
