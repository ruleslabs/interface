import { useBoundStore } from 'src/zustand'
import { shallow } from 'zustand/shallow'

export default function useAssetPlayingMedia() {
  const { tokenIdPlayingMedia, setTokenIdPlayingMedia } = useBoundStore(
    (state) => ({
      tokenIdPlayingMedia: state.tokenIdPlayingMedia,
      setTokenIdPlayingMedia: state.setTokenIdPlayingMedia,
    }),
    shallow
  )

  return [tokenIdPlayingMedia, setTokenIdPlayingMedia] as const
}
