import { useMemo, useCallback } from 'react'
import styled from 'styled-components/macro'

import Card from 'src/components/Card'
import { useOnboardingPage } from 'src/state/onboarding/hooks'
import { OnboardingPage } from 'src/state/onboarding/actions'

import DiscordJoinPage from './DiscordJoinPage'
import IntroductionPage from './IntroductionPage'
import StarterPackPage from './StarterPackPage'
import { useLocation } from 'react-router-dom'
import useLocationQuery from 'src/hooks/useLocationQuery'

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

  // pathname
  const { pathname } = useLocation()
  const anchor = useMemo(() => pathname.split('#')[1], [pathname])

  // query
  const query = useLocationQuery()
  const code = query.get('code')

  const renderModal = useCallback(
    (onboardingPage: OnboardingPage | null) => {
      if (!onboardingPage && code) onboardingPage = OnboardingPage.DISCORD_JOIN

      switch (onboardingPage) {
        default:
        case OnboardingPage.INTRODUCTION:
          return <IntroductionPage nextPage={OnboardingPage.DISCORD_JOIN} />

        case OnboardingPage.STARTER_PACK:
          return <StarterPackPage />

        case OnboardingPage.DISCORD_JOIN:
          return <DiscordJoinPage nextPage={OnboardingPage.STARTER_PACK} />
      }
    },
    [anchor]
  )

  return <StyledOnboarding>{renderModal(onboardingPage)}</StyledOnboarding>
}
