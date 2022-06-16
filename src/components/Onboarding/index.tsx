import { useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'

import Card from '@/components/Card'
import { useOnboardingPage } from '@/state/onboarding/hooks'
import { OnboardingPage } from '@/state/onboarding/actions'

import DiscordJoinPage from './DiscordJoinPage'
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
  const router = useRouter()
  const anchor = useMemo(() => router.asPath.split('#')[1], [router.asPath])

  const renderModal = useCallback(
    (onboardingPage: OnboardingPage | null) => {
      if (!onboardingPage && router.query.code) onboardingPage = OnboardingPage.DISCORD_JOIN

      switch (onboardingPage) {
        default:
          return <IntroductionPage nextPage={OnboardingPage.DISCORD_JOIN} />
        case OnboardingPage.INTRODUCTION:
          return <IntroductionPage nextPage={OnboardingPage.DISCORD_JOIN} />
        case OnboardingPage.STARTER_PACK:
          return <StarterPackPage nextPage={OnboardingPage.DISCORD_JOIN} />
        case OnboardingPage.DISCORD_JOIN:
          return <DiscordJoinPage />
      }
      return null
    },
    [anchor]
  )

  return <StyledOnboarding>{renderModal(onboardingPage)}</StyledOnboarding>
}
