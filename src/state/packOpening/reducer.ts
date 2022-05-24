import { createReducer, PayloadAction } from '@reduxjs/toolkit'

import {
  updateSoundFetchingState,
  addSoundAudioData,
  FetchingState,
  Sound,
  SoundFetchingStatePayload,
  SoundAudioDataPayload,
} from './actions'

export interface SoundsFetchingState {
  [sound: Sound]: FetchingState
}

export interface PackOpeningState {
  soundsFetchingState: SoundsFetchingState
  audioData: { [sound: Sound]: AudioBuffer | undefined }
}

export const initialState: PackOpeningState = {
  soundsFetchingState: Object.values(Sound).reduce<SoundsFetchingState>((acc, sound: Sound) => {
    acc[sound] = FetchingState.UNFETCHED
    return acc
  }, {}),
  audioData: {},
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
)
