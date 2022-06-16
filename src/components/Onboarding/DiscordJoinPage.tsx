import { useCallback } from 'react'
import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'
import { useRouter } from 'next/router'

import { TYPE } from '@/styles/theme'
import Column, { ColumnCenter } from '@/components/Column'
import { PageBody, SkipButton } from './SubComponents'
import DiscordStatus from '@/components/DiscordStatus'

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

export default function DiscordJoinPage() {
  const router = useRouter()
  const handleNext = useCallback(() => router.replace('/pack/launch-pack'), [router])

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
          <DiscordStatus redirectPath="/onboard" connectionText={t`Connect`} onConnect={handleNext} />
          <SkipButton onClick={handleNext}>
            <Trans>Skip</Trans>
          </SkipButton>
        </PageContent>
      </PageWrapper>
    </StyledPageBody>
  )
}
