import { useCallback } from 'react'
import styled from 'styled-components'

import { TYPE } from '@/styles/theme'
import { PageBody, PageContent, PageWrapper, MainActionButton } from './SubComponents'
import { useSetOnboardingPage } from '@/state/onboarding/hooks'
import { OnboardingPage } from '@/state/onboarding/actions'

const Illustration = styled.img`
  width: 35%;
  object-fit: contain;
  margin-bottom: -50px;

  ${({ theme }) => theme.media.medium`
    margin-bottom: 0;
  `}
`

interface IntroductionPageProps {
  nextPage: OnboardingPage
}

export default function IntroductionPage({ nextPage }: IntroductionPageProps) {
  const setOnboardingPage = useSetOnboardingPage()
  const handleNextPage = useCallback(() => setOnboardingPage(nextPage), [setOnboardingPage, nextPage])

  return (
    <PageBody>
      <PageWrapper>
        <Illustration src="/assets/onboarding-character.png" />
        <PageContent>
          <TYPE.large textAlign="center">Welcome !</TYPE.large>
          <TYPE.body>
            RULES is a community of passionate collectors. We support artists and fight for independence. You&apos;re
            now part of the family. Welcome!
          </TYPE.body>
          <MainActionButton onClick={handleNextPage} large>
            Next
          </MainActionButton>
        </PageContent>
        <div />
      </PageWrapper>
    </PageBody>
  )
}
