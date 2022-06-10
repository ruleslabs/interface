import styled from 'styled-components'

import Card from '@/components/Card'
import { useOnboardingPage } from '@/state/onboarding/hooks'
import { OnboardingPage } from '@/state/onboarding/actions'

import DiscordPage from './DiscordPage'
import IntroductionPage from './IntroductionPage'
import StarterPackPage from './StarterPackPage'

const StyledOnboarding = styled(Card)`
  margin: 0;
  padding: 0;
  width: 100%;

  ${({ theme }) => theme.media.medium`
    height: 100%;
    padding: 28px;
  `}
`

export default function Onboarding() {
  // page
  const onboardingPage = useOnboardingPage()

  const renderModal = (onboardingPage: OnboardingPage | null) => {
    switch (onboardingPage) {
      default:
      case OnboardingPage.INTRODUCTION:
        return <IntroductionPage nextPage={OnboardingPage.DISCORD} />
      case OnboardingPage.STARTER_PACK:
        return <StarterPackPage nextPage={OnboardingPage.DISCORD} />
      case OnboardingPage.DISCORD:
        return <DiscordPage />
    }
    return null
  }

  return <StyledOnboarding>{renderModal(onboardingPage)}</StyledOnboarding>
}
