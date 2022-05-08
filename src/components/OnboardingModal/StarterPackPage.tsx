import { useCallback } from 'react'
import styled from 'styled-components'
import { gql, useQuery } from '@apollo/client'

import { TYPE } from '@/styles/theme'
import { RowCenter } from '@/components/Row'
import Column from '@/components/Column'
import { PageBody, PageContent, PageWrapper, MainActionButton, SkipButton } from './SubComponents'
import { useSetOnboardingPage } from '@/state/onboarding/hooks'
import { OnboardingPage } from '@/state/onboarding/actions'

const PackPictureWrapper = styled(RowCenter)`
  width: 35%;
  justify-content: center;

  img {
    max-width: 256px;
    width: 100%;
    object-fit: contain;
  }
`

const LAST_STARTER_PACK = gql`
  query {
    lastStarterPack {
      pictureUrl(derivative: "width=512")
      price
    }
  }
`

interface StarterPackPageProps {
  nextPage: OnboardingPage
}

export default function StarterPackPage({ nextPage }: StarterPackPageProps) {
  const setOnboardingPage = useSetOnboardingPage()
  const handleNextPage = useCallback(() => setOnboardingPage(nextPage), [setOnboardingPage, nextPage])

  const { data, loading, error } = useQuery(LAST_STARTER_PACK)
  const lastStarterPack = data?.lastStarterPack

  return (
    <PageBody>
      <PageWrapper>
        <PackPictureWrapper>
          <img src={lastStarterPack?.pictureUrl} />
        </PackPictureWrapper>
        <PageContent>
          <TYPE.large textAlign="center">Get your first pack</TYPE.large>
          <TYPE.body>
            RULES cards can be found in packs. Packs are available in limited quantity drops. Don&apos;t panic! We have
            locked a Starter Pack for you. This pack contains 3 common cards that will get you started.
          </TYPE.body>
          <Column gap={16}>
            {lastStarterPack && (
              <MainActionButton onClick={handleNextPage} large>
                Buy - {(lastStarterPack.price / 100).toFixed(2)}€
              </MainActionButton>
            )}
            <SkipButton onClick={handleNextPage}>Skip</SkipButton>
          </Column>
        </PageContent>
        <div />
      </PageWrapper>
    </PageBody>
  )
}
