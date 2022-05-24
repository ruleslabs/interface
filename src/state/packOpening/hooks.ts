import { useCallback, useEffect, useState } from 'react'
import { gql, useMutation } from '@apollo/client'

import { AppState } from '@/state'
import { updateSoundFetchingState, addSoundAudioData, Sound, FetchingState } from './actions'
import { useAppDispatch, useAppSelector } from '@/state/hooks'

const OPEN_PACK_MUTATION = gql`
  mutation ($packId: ID!) {
    openPack(input: { packId: $packId }) {
      error {
        code
        message
        path
      }
      cards {
        slug
        serialNumber
        cardModel {
          videoUrl
          season
          scarcity {
            name
            maxSupply
          }
          artist {
            displayName
            user {
              username
              slug
            }
          }
        }
      }
    }
  }
`

export function usePackOpeningMutation() {
  return useMutation(OPEN_PACK_MUTATION)
}

export function useAudioLoop(src: string) {
  const dispatch = useAppDispatch()
  const { soundsFetchingState, audioData } = useAppSelector((state: AppState) => state.packOpening)

  const [actx, setActx] = useState(null)
  const [sourceNodes, setSourceNodes] = useState<{ [sound: Sound]: any | undefined }>({})

  const playLoop = useCallback(
    (sound: Sound) => {
      if (!actx || !audioData[sound]) return

      const newSourceNode = actx.createBufferSource() // create audio source
      newSourceNode.buffer = audioData[sound] // use decoded buffer
      newSourceNode.connect(actx.destination) // create output
      newSourceNode.loop = true // takes care of perfect looping
      newSourceNode.start()
      setSourceNodes({ ...sourceNodes, [sound]: newSourceNode })
    },
    [actx, setSourceNodes, audioData, sourceNodes]
  )

  const play = useCallback(
    (sound: Sound) => {
      console.log(audioData)
      if (!actx) return

      if (actx.state === 'suspended') actx.resume().then(() => playLoop(sound))
      else playLoop(sound)
    },
    [actx, playLoop]
  )

  const pause = useCallback(
    (sound: Sound) => {
      sourceNodes[sound]?.stop()
      setSourceNodes({ ...sourceNodes, [sound]: undefined })
    },
    [sourceNodes, setSourceNodes, actx]
  )

  const decode = useCallback(
    (buffer, sound: Sound) => {
      actx?.decodeAudioData(
        buffer,
        (audioBuffer) => {
          dispatch(addSoundAudioData({ sound, buffer: audioBuffer }))
        },
        (error) => console.error(error)
      )
    },
    [actx, dispatch, addSoundAudioData]
  )

  useEffect(() => {
    if (!actx) {
      setActx(new (window.AudioContext || window.webkitAudioContext)())
      return
    }

    Object.values(Sound).forEach((sound, index: number) => {
      if (soundsFetchingState[sound] === FetchingState.UNFETCHED) {
        dispatch(updateSoundFetchingState({ sound, fetchingState: FetchingState.FETCHING }))
        fetch(`/sounds/${sound}.wav`, { mode: 'cors' })
          .then((res) => res.arrayBuffer())
          .then((buffer) => {
            decode(buffer, sound)
            dispatch(updateSoundFetchingState({ sound, fetchingState: FetchingState.FETCHED }))
          })
      }
    })
  }, [decode, audioData, dispatch, updateSoundFetchingState, soundsFetchingState, actx, setActx])

  return [play, pause]
}
