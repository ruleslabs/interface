import styled from 'styled-components'
import { useRouter } from 'next/router'
import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import Column, { ColumnCenter } from '@/components/Column'
import { PageBody, SkipButton, MainActionButton } from './SubComponents'
import Link from '@/components/Link'

const StyledPageBody = styled(PageBody)`
  ${({ theme }) => theme.media.medium`
    padding: 48px 32px 0;
  `}
`

const DiscordScreenWrapper = styled.div`
  position: relative;
  flex: 1;
  width: 100%;

  img {
    left: 0;
    right: 0;
    height: 100%;
    width: 100%;
    position: absolute;
    object-fit: contain;
  }

  ${({ theme }) => theme.media.medium`
    img {
      position: initial;
    }
  `}
`

const PageWrapper = styled(ColumnCenter)`
  gap: 24px;
  position: absolute;
  top: 48px;
  left: 0;
  right: 0;
  bottom: 38px;

  ${({ theme }) => theme.media.medium`
    position: initial;
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

export default function DiscordPage() {
  const router = useRouter()

  return (
    <StyledPageBody>
      <PageWrapper>
        <TYPE.large textAlign="center">
          <Trans>Join the Discord</Trans>
        </TYPE.large>
        <DiscordScreenWrapper>
          <img src="/assets/discord-screen.png" />
        </DiscordScreenWrapper>
        <PageContent>
          <Link href="https://discord.gg/DrfezKYUhH" target="_blank">
            <MainActionButton large>
              <Trans>Join</Trans>
            </MainActionButton>
          </Link>
          <SkipButton onClick={() => router.back()}>
            <Trans>Skip</Trans>
          </SkipButton>
        </PageContent>
      </PageWrapper>
    </StyledPageBody>
  )
}
