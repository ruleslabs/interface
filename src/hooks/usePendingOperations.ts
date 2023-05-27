import { useBoundStore } from 'src/zustand'
import { shallow } from 'zustand/shallow'

export default function usePendingOperations() {
  const { pendingOperations, subscribeToOperations, pushOperation } = useBoundStore(
    (state) => ({
      pendingOperations: state.pendingOperations,
      pushOperation: state.pushOperation,
      subscribeToOperations: state.subscribeToOperations,
    }),
    shallow
  )

  return { pendingOperations, subscribeToOperations, pushOperation }
}
