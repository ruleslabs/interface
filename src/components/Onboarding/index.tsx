import { useMemo, useEffect } from 'react'

import { useOnboardingPage, useSetOnboardingPage } from 'src/state/onboarding/hooks'
import { OnboardingPage } from 'src/state/onboarding/actions'
import * as styles from './style.css'
import Box from 'src/theme/components/Box'
import useLocationQuery from 'src/hooks/useLocationQuery'

import DiscordJoinPage from './DiscordJoinPage'
import IntroductionPage from './IntroductionPage'
import StarterPackPage from './StarterPackPage'

export default function Onboarding() {
  // page
  const onboardingPage = useOnboardingPage()
  const setOnboardingPage = useSetOnboardingPage()

  // query
  const query = useLocationQuery()
  const code = query.get('code')

  // directly switch to discord page if a code is available
  useEffect(() => {
    if (code) setOnboardingPage(OnboardingPage.DISCORD_JOIN)
  }, [])

  const onboardingPageComponent = useMemo(() => {
    switch (onboardingPage) {
      default:
      case OnboardingPage.INTRODUCTION:
        return <IntroductionPage nextPage={OnboardingPage.DISCORD_JOIN} />

      case OnboardingPage.STARTER_PACK:
        return <StarterPackPage />

      case OnboardingPage.DISCORD_JOIN:
        return <DiscordJoinPage nextPage={OnboardingPage.STARTER_PACK} />
    }
  }, [onboardingPage])

  return (
    <Box className={styles.onboardingContainer}>
      <Box className={styles.pageWrapper}>{onboardingPageComponent}</Box>
    </Box>
  )
}
