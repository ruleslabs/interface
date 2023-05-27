import { useBoundStore } from 'src/zustand'
import { shallow } from 'zustand/shallow'

export default function usePendingOperations() {
  const { pendingOperations, cleanOperations, pushOperation } = useBoundStore(
    (state) => ({
      pendingOperations: state.pendingOperations,
      pushOperation: state.pushOperation,
      cleanOperations: state.cleanOperations,
    }),
    shallow
  )

  return { pendingOperations, cleanOperations, pushOperation }
}
