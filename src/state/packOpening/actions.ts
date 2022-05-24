import { createAction } from '@reduxjs/toolkit'

export enum FetchingState {
  UNFETCHED,
  FETCHING,
  FETCHED,
}

export enum Sound {
  BEFORE_PACK_OPENING = 'before-pack-opening',
  DURING_PACK_OPENING = 'during-pack-opening',
  OPENED_PACK = 'opened-pack',
}

export interface SoundFetchingStatePayload {
  sound: Sound
  FetchingState: FetchingState
}

export interface SoundAudioDataPayload {
  sound: Sound
  buffer: AudioBuffer
}

export const updateSoundFetchingState = createAction<SoundFetchingStatePayload>('packOpening/updateSoundFetchingState')
export const addSoundAudioData = createAction<SoundAudioDataPayload>('packOpening/addSoundAudioData')
