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
  FX_PACK_OPENING = 'fx-pack-opening',
  FX_COMMON = 'fx-common',
  FX_PLATINIUM = 'fx-platinium',
  PLATINIUM_FOCUS = 'platinium-focus',
  COMMON_FOCUS = 'common-focus',
}

export interface PackPayload {
  pack: any
}

export interface SoundFetchingStatePayload {
  sound: Sound
  fetchingState: FetchingState
}

export interface SoundAudioDataPayload {
  sound: Sound
  buffer: AudioBuffer
}

export interface AudioContextPayload {
  audioContext: AudioContext | null
}

export interface NodePayload {
  node: any | null
}

export interface GainPayload {
  gain: number
}

export interface SoundPayload {
  sound: Sound | null
}

export const setPackToPrepare = createAction<PackPayload>('packOpening/setPackToPrepare')

export const updateSoundFetchingState = createAction<SoundFetchingStatePayload>('packOpening/updateSoundFetchingState')
export const addSoundAudioData = createAction<SoundAudioDataPayload>('packOpening/addSoundAudioData')
export const updateAudioContext = createAction<AudioContextPayload>('packOpening/updateAudioContext')
export const updateLoopSourceNode = createAction<NodePayload>('packOpening/updateLoopSourceNode')
export const updateGainNode = createAction<NodePayload>('packOpening/updateGainNode')
export const updateLatestSound = createAction<SoundPayload>('packOpening/updateLatestSound')
export const updateGain = createAction<GainPayload>('packOpening/updateGain')
