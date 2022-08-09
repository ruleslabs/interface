import { useCallback } from 'react'
import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import Column, { ColumnCenter } from '@/components/Column'
import { PageBody, SkipButton } from './SubComponents'
import DiscordStatus from '@/components/DiscordStatus'
import { useSetOnboardingPage } from '@/state/onboarding/hooks'
import { OnboardingPage } from '@/state/onboarding/actions'

const StyledPageBody = styled(PageBody)`
  ${({ theme }) => theme.media.medium`
    padding: 48px 32px 0;
  `}

  ${({ theme }) => theme.media.small`
    padding: 0;
  `}
`

const DiscordScreenWrapper = styled(ColumnCenter)`
  flex: 1;
  justify-content: center;

  img {
    max-width: 512px;
    width: 100%;
    object-fit: contain;
  }
`

const PageWrapper = styled(ColumnCenter)`
  gap: 24px;
  position: absolute;
  top: 120px;
  left: 0;
  right: 0;
  bottom: 100px;

  ${({ theme }) => theme.media.medium`
    position: initial;
    gap: 64px;
  `}
`

const PageContent = styled(Column)`
  width: 440px;
  gap: 16px;

  * {
    width: 100%;
  }

  ${({ theme }) => theme.media.small`
    width: 100%;
  `}
`

interface DiscordJoinPageProps {
  nextPage: OnboardingPage
}

export default function DiscordJoinPage({ nextPage }: DiscordJoinPageProps) {
  const setOnboardingPage = useSetOnboardingPage()
  const handleNextPage = useCallback(() => setOnboardingPage(nextPage), [setOnboardingPage, nextPage])

  return (
    <StyledPageBody>
      <PageWrapper>
        <TYPE.large textAlign="center">
          <Trans>Connect your Discord account</Trans>
        </TYPE.large>
        <DiscordScreenWrapper>
          <img src="/assets/discord-connect.png" />
        </DiscordScreenWrapper>
        <PageContent>
          <DiscordStatus redirectPath="/onboard" connectionText={t`Connect`} onConnect={handleNextPage} />
          <SkipButton onClick={handleNextPage}>
            <Trans>Skip</Trans>
          </SkipButton>
        </PageContent>
      </PageWrapper>
    </StyledPageBody>
  )
}
