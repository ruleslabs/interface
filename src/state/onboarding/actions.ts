import { createAction } from '@reduxjs/toolkit'

export enum OnboardingPage {
  INTRODUCTION,
  STARTER_PACK,
  DISCORD,
}

export interface OnboardingPagePayload {
  onboardingPage: OnboardingPage | null
}

export const setOnboardingPage = createAction<OnboardingPagePayload>('onboarding/setOnboardingPage')
