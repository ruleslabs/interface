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
  const { soundsFetchingState, audioData, nextLoopSound } = useAppSelector((state: AppState) => state.packOpening)

  const [actx, setActx] = useState(null)
  const [sourceNode, setSourceNode] = useState(null)
  const [currentLoopSound, setCurrentLoopSound] = useState(null)

  const pause = useCallback(() => {
    sourceNode.stop()
    setSourceNode(null)
  }, [sourceNode, setSourceNode, actx])

  const playLoop = useCallback(
    (sound?: Sound) => {
      sound = sound ?? currentLoopSound
      if (!actx || !sound || !audioData[sound]) return

      if (sourceNode) pause()

      const newSourceNode = actx.createBufferSource() // create audio source
      newSourceNode.buffer = audioData[sound] // use decoded buffer
      newSourceNode.connect(actx.destination) // create output
      newSourceNode.loop = true // takes care of perfect looping
      newSourceNode.start()
      setSourceNode(newSourceNode)
    },
    [actx, setSourceNode, audioData, sourceNode, pause, currentLoopSound, setCurrentLoopSound]
  )

  const play = useCallback(() => {
    if (!actx) return

    if (actx.state === 'suspended') actx.resume().then(() => playLoop())
    else playLoop()
  }, [actx, playLoop])

  const loop = useCallback(
    (sound: Sound) => {
      setCurrentLoopSound(sound)
      if (sourceNode) {
        sourceNode.onended = () => playLoop(sound)
        sourceNode.loop = false
      }
    },
    [setCurrentLoopSound, sourceNode, playLoop]
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

  return [play, pause, loop, currentLoopSound]
}
