import { useCallback } from 'react'
import { Trans } from '@lingui/macro'

import { useSetOnboardingPage } from 'src/state/onboarding/hooks'
import { OnboardingPage } from 'src/state/onboarding/actions'
import Image from 'src/theme/components/Image'
import { Column } from 'src/theme/components/Flex'
import { PrimaryButton } from '../Button'
import * as Text from 'src/theme/components/Text'
import * as styles from './style.css'
import Box from 'src/theme/components/Box'

interface IntroductionPageProps {
  nextPage: OnboardingPage
}

export default function IntroductionPage({ nextPage }: IntroductionPageProps) {
  const setOnboardingPage = useSetOnboardingPage()
  const handleNextPage = useCallback(() => setOnboardingPage(nextPage), [setOnboardingPage, nextPage])

  return (
    <Box className={styles.infoPageContainer}>
      <Image className={styles.illustration} src="/assets/onboarding-character.png" />

      <Column className={styles.infoContainer}>
        <Text.HeadlineLarge textAlign={'center'}>
          <Trans>Welcome !</Trans>
        </Text.HeadlineLarge>

        <Text.Body>
          <Trans>
            RULES is a community of passionate collectors. We support artists and fight for independence. You&apos;re
            now part of the family. Welcome!
          </Trans>
        </Text.Body>

        <PrimaryButton onClick={handleNextPage} width={'full'} large>
          <Trans>Next</Trans>
        </PrimaryButton>
      </Column>
    </Box>
  )
}
