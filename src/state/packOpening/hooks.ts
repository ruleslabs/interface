import { useCallback, useEffect } from 'react'
import { gql, useMutation } from '@apollo/client'

import { AppState } from '@/state'
import {
  updateSoundFetchingState,
  addSoundAudioData,
  updateAudioContext,
  updateLatestSound,
  updateLoopSourceNode,
  updateGainNode,
  Sound,
  FetchingState,
} from './actions'
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
  const { soundsFetchingState, audioData, audioContext, loopSourceNode, gainNode, latestLoopSound } = useAppSelector(
    (state: AppState) => state.packOpening
  )

  const playLoop = useCallback(
    (sound: Sound) => {
      sound = sound || latestLoopSound
      if (!audioContext || !gainNode || !sound || !audioData[sound]) return

      if (loopSourceNode) loopSourceNode.stop()

      const sourceNode = audioContext.createBufferSource() // create audio source
      sourceNode.buffer = audioData[sound] // use decoded buffer
      sourceNode.connect(audioContext.destination) // create output
      sourceNode.connect(gainNode) // connect to gain node
      sourceNode.loop = true // takes care of perfect looping
      sourceNode.start()

      dispatch(updateLoopSourceNode({ node: sourceNode }))
    },
    [audioContext, dispatch, updateLoopSourceNode, audioData, gainNode, latestLoopSound, loopSourceNode]
  )

  const loop = useCallback(
    (sound: Sound) => {
      dispatch(updateLatestSound({ sound }))

      if (loopSourceNode) {
        loopSourceNode.onended = () => playLoop(sound)
        loopSourceNode.loop = false
      } else playLoop(sound)
    },
    [loopSourceNode, playLoop, dispatch, updateLatestSound]
  )

  const fx = useCallback(
    (sound: Sound) => {
      if (!audioContext || !sound || !audioData[sound]) return

      const fxSourceNode = audioContext.createBufferSource() // create audio source
      fxSourceNode.buffer = audioData[sound] // use decoded buffer
      fxSourceNode.connect(audioContext.destination) // create output
      fxSourceNode.connect(gainNode) // connect to gain node
      fxSourceNode.start()
    },
    [audioContext, audioData]
  )

  const mute = useCallback(() => gainNode?.gain.setValueAtTime(-1, audioContext.currentTime), [audioContext, gainNode])
  const unmute = useCallback(() => {
    gainNode?.gain.setValueAtTime(1, audioContext.currentTime)
    if (audioContext.state === 'suspended') audioContext.resume().then(() => playLoop())
  }, [audioContext, gainNode, playLoop])

  const decode = useCallback(
    (buffer, sound: Sound) => {
      audioContext?.decodeAudioData(
        buffer,
        (audioBuffer) => {
          dispatch(addSoundAudioData({ sound, buffer: audioBuffer }))
        },
        (error) => console.error(error)
      )
    },
    [audioContext, dispatch, addSoundAudioData]
  )

  useEffect(() => {
    // Init
    if (!audioContext) {
      const newAudioContext = new (window.AudioContext || window.webkitAudioContext)()
      const newGainNode = newAudioContext.createGain()

      newGainNode.gain.setValueAtTime(-1, newAudioContext.currentTime)
      newGainNode.connect(newAudioContext.destination)

      dispatch(updateAudioContext({ audioContext: newAudioContext }))
      dispatch(updateGainNode({ node: newGainNode }))
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
  }, [
    decode,
    dispatch,
    updateSoundFetchingState,
    soundsFetchingState,
    audioContext,
    dispatch,
    updateAudioContext,
    updateGainNode,
  ])

  return { mute, unmute, loop, fx, latestLoopSound }
}
