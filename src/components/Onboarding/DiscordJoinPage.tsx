import { useCallback } from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'

import DiscordStatus from 'src/components/Settings/DiscordStatus'
import { useSetOnboardingPage } from 'src/state/onboarding/hooks'
import { OnboardingPage } from 'src/state/onboarding/actions'
import { Column } from 'src/theme/components/Flex'
import * as Text from 'src/theme/components/Text'
import { PrimaryButton, SecondaryButton } from '../Button'
import Box from 'src/theme/components/Box'
import * as styles from './style.css'
import useCurrentUser from 'src/hooks/useCurrentUser'

const StyledDiscordStatus = styled(DiscordStatus)`
  width: 100%;
`

interface DiscordJoinPageProps {
  nextPage: OnboardingPage
}

export default function DiscordJoinPage({ nextPage }: DiscordJoinPageProps) {
  const setOnboardingPage = useSetOnboardingPage()
  const handleNextPage = useCallback(() => setOnboardingPage(nextPage), [setOnboardingPage, nextPage])

  // discord connection satus
  const { currentUser } = useCurrentUser()
  const isConnected = !!currentUser?.profile?.discordMember

  const NextButton = isConnected ? PrimaryButton : SecondaryButton

  return (
    <Box className={styles.discordPageContainer}>
      <Column width={'440'}>
        <Column gap={'64'} alignItems={'center'} justifyContent={'center'}>
          <Text.HeadlineLarge textAlign={'center'}>
            <Trans>Connect your Discord account</Trans>
          </Text.HeadlineLarge>

          <StyledDiscordStatus redirectPath="/onboard" />

          <NextButton onClick={handleNextPage} width={'250'} large>
            <Trans>Skip</Trans>
          </NextButton>
        </Column>
      </Column>
    </Box>
  )
}
