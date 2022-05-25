import { createReducer, PayloadAction } from '@reduxjs/toolkit'

import {
  updateSoundFetchingState,
  addSoundAudioData,
  updateAudioContext,
  updateLatestSound,
  updateLoopSourceNode,
  updateGainNode,
  FetchingState,
  Sound,
  SoundFetchingStatePayload,
  SoundAudioDataPayload,
  AudioContextPayload,
  NodePayload,
  SoundPayload,
} from './actions'

export interface SoundsFetchingState {
  [sound: Sound]: FetchingState
}

export interface PackOpeningState {
  soundsFetchingState: SoundsFetchingState
  audioData: { [sound: Sound]: AudioBuffer | undefined }
  audioContext: AudioContext | null
  loopSourceNode: any | null
  gainNode: any | null
  latestLoopSound: Sound | null
}

export const initialState: PackOpeningState = {
  soundsFetchingState: Object.values(Sound).reduce<SoundsFetchingState>((acc, sound: Sound) => {
    acc[sound] = FetchingState.UNFETCHED
    return acc
  }, {}),
  audioData: {},
  audioContext: null,
  loopSourceNode: null,
  gainNode: null,
  latestLoopSound: null,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateSoundFetchingState, (state, action: PayloadAction<SoundFetchingStatePayload>) => {
      const { sound, fetchingState } = action.payload
      state.soundsFetchingState[sound] = fetchingState
    })
    .addCase(addSoundAudioData, (state, action: PayloadAction<SoundAudioDataPayload>) => {
      const { sound, buffer } = action.payload
      state.audioData[sound] = buffer
    })
    .addCase(updateAudioContext, (state, action: PayloadAction<AudioContextPayload>) => {
      const { audioContext } = action.payload
      state.audioContext = audioContext
    })
    .addCase(updateLoopSourceNode, (state, action: PayloadAction<NodePayload>) => {
      const { node } = action.payload
      state.loopSourceNode = node
    })
    .addCase(updateGainNode, (state, action: PayloadAction<NodePayload>) => {
      const { node } = action.payload
      state.gainNode = node
    })
    .addCase(updateLatestSound, (state, action: PayloadAction<SoundPayload>) => {
      const { sound } = action.payload
      state.latestLoopSound = sound
    })
)
