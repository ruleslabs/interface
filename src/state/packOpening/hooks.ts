import { useCallback, useEffect, useState } from 'react'
import { gql, useMutation } from '@apollo/client'

import { AppState } from '@/state'
import {
  updateSoundFetchingState,
  addSoundAudioData,
  updateAudioContext,
  updateLatestSound,
  updateLoopSourceNode,
  updateGainNode,
  updateGain,
  Sound,
  FetchingState,
} from './actions'
import { useAppDispatch, useAppSelector } from '@/state/hooks'

const PREPARE_PACK_OPENING_MUTATION = gql`
  mutation ($packId: ID!) {
    preparePackOpening(input: { packId: $packId }) {
      error {
        code
        message
        path
      }
    }
  }
`

const OPEN_PACK_MUTATION = gql`
  mutation ($packId: ID!) {
    openPack(input: { packId: $packId }) {
      error {
        code
        message
        path
      }
      cards {
        serialNumber
        cardModel {
          videoUrl
          pictureUrl(derivative: "width=1024")
          scarcity {
            name
          }
        }
      }
    }
  }
`

export function usePackOpeningPreparationMutation() {
  return useMutation(PREPARE_PACK_OPENING_MUTATION)
}

export function usePackOpeningMutation() {
  return useMutation(OPEN_PACK_MUTATION)
}

export function useAudioLoop() {
  const dispatch = useAppDispatch()
  const { soundsFetchingState, audioData, audioContext, loopSourceNode, gainNode, latestLoopSound } = useAppSelector(
    (state: AppState) => state.packOpening
  )

  const [isMute, setIsMute] = useState(true)

  const playLoop = useCallback(
    (sound: Sound | null) => {
      if (!audioContext || !gainNode || !sound || !audioData[sound]) return

      if (loopSourceNode) loopSourceNode.stop()

      const sourceNode = audioContext.createBufferSource()
      sourceNode.buffer = audioData[sound] ?? null
      sourceNode.connect(gainNode).connect(audioContext.destination)
      sourceNode.loop = true
      sourceNode.start()

      dispatch(updateLoopSourceNode({ node: sourceNode }))
    },
    [audioContext, dispatch, updateLoopSourceNode, audioData, gainNode, loopSourceNode]
  )

  const loop = useCallback(
    (sound: Sound) => {
      dispatch(updateLatestSound({ sound }))

      if (loopSourceNode) {
        console.log(sound)
        loopSourceNode.onended = () => playLoop(sound)
        loopSourceNode.loop = false
      } else playLoop(sound)
    },
    [loopSourceNode, playLoop, dispatch, updateLatestSound]
  )

  const fx = useCallback(
    (sound: Sound) => {
      if (!audioContext || !sound || !gainNode || !audioData[sound]) return

      const fxSourceNode = audioContext.createBufferSource()
      fxSourceNode.buffer = audioData[sound] ?? null
      fxSourceNode.connect(gainNode).connect(audioContext.destination)
      fxSourceNode.start()
    },
    [audioContext, audioData, gainNode]
  )

  const mute = useCallback(() => {
    if (!audioContext || !gainNode) return

    console.log(gainNode.gain.value)

    setIsMute(true)
    dispatch(updateGain({ gain: 0 }))
  }, [audioContext, gainNode, setIsMute, dispatch, updateGain])

  const unmute = useCallback(() => {
    if (!audioContext || !gainNode) return

    console.log(gainNode.gain.value)

    setIsMute(false)
    dispatch(updateGain({ gain: 1 }))
    if (audioContext.state === 'suspended') audioContext.resume().then(() => playLoop(latestLoopSound))
  }, [audioContext, gainNode, playLoop, latestLoopSound, setIsMute, dispatch, updateGain])

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

      dispatch(updateAudioContext({ audioContext: newAudioContext }))
      dispatch(updateGainNode({ node: newGainNode }))

      if (newAudioContext.state === 'running') {
        setIsMute(false)
        dispatch(updateGain({ gain: 1 }))
      } else dispatch(updateGain({ gain: 0 }))
      return
    } else if (latestLoopSound && !loopSourceNode) {
      playLoop(latestLoopSound)
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
    updateGain,
    audioData,
    playLoop,
    latestLoopSound,
  ]) // Could be better ^^

  useEffect(() => {
    if (!audioContext) return
    return () => {
      if (loopSourceNode) loopSourceNode.stop()
      if (audioContext.state !== 'closed') audioContext.close()
      dispatch(updateAudioContext({ audioContext: null }))
      dispatch(updateGainNode({ node: null }))
      dispatch(updateLoopSourceNode({ node: null }))
      dispatch(updateLatestSound({ sound: null }))
    }
  }, [audioContext])

  return { mute, unmute, isMute, loop, fx, latestLoopSound }
}
