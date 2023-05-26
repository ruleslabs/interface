import { useBoundStore } from 'src/zustand'
import { shallow } from 'zustand/shallow'

export default function usePendingOperations() {
  const { pendingOperations, subscribePendingOperations } = useBoundStore(
    (state) => ({
      pendingOperations: state.pendingOperations,
      subscribePendingOperations: state.subscribePendingOperations,
    }),
    shallow
  )

  return { pendingOperations, subscribePendingOperations }
}
