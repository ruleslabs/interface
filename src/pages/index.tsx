import { useEffect } from 'react'

import OnboardingModal from '@/components/OnboardingModal'
import { useOnboardingModalToggle } from '@/state/application/hooks'
import { useSetOnboardingPage } from '@/state/onboarding/hooks'
import { OnboardingPage } from '@/state/onboarding/actions'

export default function Home() {
  const onboardingModalToggle = useOnboardingModalToggle()
  const setOnboardingPage = useSetOnboardingPage()

  useEffect(() => {
    setOnboardingPage(OnboardingPage.INTRODUCTION)
    onboardingModalToggle()
  }, [])

  return <OnboardingModal />
}
