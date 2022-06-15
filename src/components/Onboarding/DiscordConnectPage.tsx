import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import { useRouter } from 'next/router'

import { TYPE } from '@/styles/theme'
import Column from '@/components/Column'
import { PageBody, PageContent, PageWrapper, SkipButton } from './SubComponents'
import DiscordStatus from '@/components/DiscordStatus'

const StyledPageWrapper = styled(PageWrapper)`
  justify-content: center;

  & > div:last-child {
    display: flex !important;
  }
`

const StyledPageContent = styled(PageContent)`
  width: 540px;
  gap: 48px;

  * {
    width: unset;
  }

  button {
    width: 100%;
  }

  ${({ theme }) => theme.media.small`
    width: 100%;
  `}
`

export default function IntroductionPage() {
  const router = useRouter()

  return (
    <PageBody>
      <StyledPageWrapper>
        <StyledPageContent>
          <TYPE.large textAlign="center">
            <Trans>Connect your discord account !</Trans>
          </TYPE.large>
          <TYPE.body textAlign="center">
            <Trans>
              Accède aux avantages:
              <br />
              - ceci
              <br />
              - cela
              <br />- et ça
            </Trans>
          </TYPE.body>
          <Column gap={16}>
            <DiscordStatus redirectPath="/onboard" />
            <SkipButton onClick={() => router.back()}>
              <Trans>Skip</Trans>
            </SkipButton>
          </Column>
        </StyledPageContent>
      </StyledPageWrapper>
    </PageBody>
  )
}
