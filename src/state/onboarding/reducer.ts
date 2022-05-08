import { createReducer, PayloadAction } from '@reduxjs/toolkit'

import { setOnboardingPage, OnboardingPage, OnboardingPagePayload } from './actions'

export interface OnboardingState {
  onboardingPage: OnboardingPage | null
}

export const initialState: OnboardingState = {
  onboardingPage: null,
}

export default createReducer(initialState, (builder) =>
  builder.addCase(setOnboardingPage, (state, action: PayloadAction<OnboardingPagePayload>) => {
    const { onboardingPage } = action.payload
    state.onboardingPage = onboardingPage
  })
)
