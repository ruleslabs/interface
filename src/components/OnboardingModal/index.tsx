import styled from 'styled-components'

import Section from '@/components/Section'
import Modal from '@/components/Modal'
import { useModalOpen, useOnboardingModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { useOnboardingPage } from '@/state/onboarding/hooks'
import { OnboardingPage } from '@/state/onboarding/actions'

import DiscordPage from './DiscordPage'
import IntroductionPage from './IntroductionPage'
import StarterPackPage from './StarterPackPage'

const StyledOnboardingModal = styled(Section)`
  background: ${({ theme }) => theme.bg2};
  border-radius: 4px;
  margin: 0;
  padding: 0;
  width: calc(100vw - 64px);

  ${({ theme }) => theme.media.medium`
    width: 100%;
    height: 100%;
  `}
`

export default function OnboardingModal() {
  // modal
  const isOpen = useModalOpen(ApplicationModal.ONBOARDING)
  const toggleOnboardingModal = useOnboardingModalToggle()

  const onboardingPage = useOnboardingPage()

  const renderModal = (onboardingPage: OnboardingPage | null) => {
    switch (onboardingPage) {
      default:
      case OnboardingPage.INTRODUCTION:
        return <IntroductionPage nextPage={OnboardingPage.STARTER_PACK} />
      case OnboardingPage.STARTER_PACK:
        return <StarterPackPage nextPage={OnboardingPage.DISCORD} />
      case OnboardingPage.DISCORD:
        return <DiscordPage />
    }
    return null
  }

  return (
    <Modal onDismiss={toggleOnboardingModal} isOpen={isOpen}>
      <StyledOnboardingModal>{renderModal(onboardingPage)}</StyledOnboardingModal>
    </Modal>
  )
}
