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
  const [gainNode, setGainNode] = useState(null)
  const [currentLoopSound, setCurrentLoopSound] = useState(null)

  const playLoop = useCallback(
    (sound: Sound) => {
      sound = sound || currentLoopSound
      if (!actx || !gainNode || !sound || !audioData[sound]) return

      if (sourceNode) sourceNode.stop()

      const newSourceNode = actx.createBufferSource() // create audio source
      newSourceNode.buffer = audioData[sound] // use decoded buffer
      newSourceNode.connect(actx.destination) // create output
      newSourceNode.connect(gainNode) // connect to gain node
      newSourceNode.loop = true // takes care of perfect looping
      newSourceNode.start()

      setSourceNode(newSourceNode)
    },
    [actx, setSourceNode, audioData, sourceNode, gainNode, currentLoopSound]
  )

  const loop = useCallback(
    (sound: Sound) => {
      setCurrentLoopSound(sound)

      if (sourceNode) {
        sourceNode.onended = () => playLoop(sound)
        sourceNode.loop = false
      } else playLoop(sound)
    },
    [sourceNode, playLoop, setCurrentLoopSound]
  )

  const fx = useCallback(
    (sound: Sound) => {
      if (!actx || !sound || !audioData[sound]) return

      const fxSourceNode = actx.createBufferSource() // create audio source
      fxSourceNode.buffer = audioData[sound] // use decoded buffer
      fxSourceNode.connect(actx.destination) // create output
      fxSourceNode.connect(gainNode) // connect to gain node
      fxSourceNode.start()
    },
    [actx, audioData]
  )

  const mute = useCallback(() => gainNode?.gain.setValueAtTime(-1, actx.currentTime), [actx, gainNode])
  const unmute = useCallback(() => {
    gainNode?.gain.setValueAtTime(1, actx.currentTime)
    if (actx.state === 'suspended') actx.resume().then(() => playLoop())
  }, [actx, gainNode, playLoop])

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
    // Init
    if (!actx) {
      const newActx = new (window.AudioContext || window.webkitAudioContext)()
      const newGainNode = newActx.createGain()

      newGainNode.gain.setValueAtTime(-1, newActx.currentTime)
      newGainNode.connect(newActx.destination)

      setGainNode(newGainNode)
      setActx(newActx)
      return
    }

    // Fetch sounds
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
  }, [decode, dispatch, updateSoundFetchingState, soundsFetchingState, actx, setActx, setGainNode])

  return { mute, unmute, loop, fx, currentLoopSound }
}
