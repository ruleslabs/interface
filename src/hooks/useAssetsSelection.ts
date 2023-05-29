import { useBoundStore } from 'src/zustand'
import { shallow } from 'zustand/shallow'

export default function useAssetsSelection() {
  return useBoundStore(
    (state) => ({
      selectedTokenIds: state.selectedTokenIds,
      toggleTokenIdSelection: state.toggleTokenIdSelection,
      selectionModeEnabled: state.selectionModeEnabled,
      toggleSelectionMode: state.toggleSelectionMode,
    }),
    shallow
  )
}
