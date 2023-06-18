import { shallow } from 'zustand/shallow'

import { useBoundStore } from 'src/zustand'

export default function useStarknetMessages() {
  return useBoundStore(
    (state) => ({
      pushMessages: state.stxPushMessages,

      messages: state.stxMessages,

      resetStarknetTx: state.stxResetStarknetTx,

      setSigning: state.stxSetSigning,
      signing: state.stxSigning,
    }),
    shallow
  )
}
