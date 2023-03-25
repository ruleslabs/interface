import React, { useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useRouter } from 'next/router'

import Section from '@/components/Section'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import Card from '@/components/Card'
import HOMEPAGE from '@/components/Homepage'
import DefaultLayout from '@/components/Layout'
import { useAuthModalToggle } from '@/state/application/hooks'
import { useSetAuthMode } from '@/state/auth/hooks'
import { AuthMode } from '@/state/auth/actions'
import useWindowSize from '@/hooks/useWindowSize'

const BackgroundVideo = styled.video<{ windowHeight?: number }>`
  height: 40vh;
  z-index: -1;
  position: fixed;
  width: 100%;
  top: ${({ theme }) => theme.size.headerHeight}px;
  object-fit: cover;
`

const BackgroundVideoGradient = styled.div`
  height: 40vh;
  z-index: -1;
  position: absolute;
  width: 100%;
  top: ${({ theme }) => theme.size.headerHeight}px;
  background: ${({ theme }) => `linear-gradient(0deg, ${theme.bg1} 0, ${theme.bg1}00 300px)`};
`

const BackgroundVideoOffset = styled.div`
  height: 40vh;
`

const HomeWrapper = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.bg1};
`

const HomeContent = styled.div`
  transform: translateY(-64px);
`

const StyledHome = styled(Section)`
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 32px;

  ${({ theme }) => theme.media.small`
    margin-top: 32px;
    flex-direction: column;
  `}
`

const Aside = styled(Column)`
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  flex: 0;
  gap: 32px;
  height: fit-content;

  & > div {
    width: 290px;
    min-width: 290px;
  }
`

const LastOffersColumn = styled(Column)`
  flex: 1;
`

const StyledCard = styled(Card)`
  padding: 20px;
`

interface ArticleProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
}

function Article({ title, children, ...props }: ArticleProps) {
  return (
    <Column gap={12} {...props}>
      <TYPE.large>{title}</TYPE.large>
      {children}
    </Column>
  )
}

function Home() {
  // router
  const router = useRouter()

  // modal
  const toggleAuthModal = useAuthModalToggle()
  const setAuthMode = useSetAuthMode()

  const togglePasswordUpdateModal = useCallback(() => {
    setAuthMode(AuthMode.UPDATE_PASSWORD)
    toggleAuthModal()
  }, [toggleAuthModal, setAuthMode])

  const toggleTwoFactorAuthSecretRemovalModal = useCallback(() => {
    setAuthMode(AuthMode.REMOVE_TWO_FACTOR_AUTH_SECRET)
    toggleAuthModal()
  }, [toggleAuthModal, setAuthMode])

  // ?action
  useEffect(() => {
    switch (router.query.action) {
      case 'update-password':
        togglePasswordUpdateModal()
        break

      case 'remove-2fa':
        toggleTwoFactorAuthSecretRemovalModal()
    }
  }, [])

  // window size
  const windowSize = useWindowSize()

  return (
    <>
      <BackgroundVideo
        windowHeight={windowSize.height}
        src="https://videos.rules.art/mp4/homepage.mp4"
        playsInline
        loop
        autoPlay
        muted
      />

      <BackgroundVideoGradient />

      <BackgroundVideoOffset />

      <HomeWrapper>
        <HomeContent>
          <StyledHome>
            <Aside>
              <Article title={t`Live`}>
                <StyledCard>
                  <HOMEPAGE.Live />
                </StyledCard>
              </Article>

              <Article title={t`Hall of fame`}>
                <StyledCard>
                  <HOMEPAGE.HallOfFame />
                </StyledCard>
              </Article>

              <Article title={t`Artists fund`}>
                <StyledCard>
                  <HOMEPAGE.ArtistsFund />
                </StyledCard>
              </Article>

              <Article title={t`Community creations`}>
                <StyledCard>
                  <HOMEPAGE.CommunityCreations />
                </StyledCard>
              </Article>
            </Aside>

            <LastOffersColumn>
              <Article title={t`Last offers`}>
                <HOMEPAGE.LastOffers />
              </Article>
            </LastOffersColumn>
          </StyledHome>
        </HomeContent>
      </HomeWrapper>
    </>
  )
}

const FooterMargin = styled.div`
  display: none;
  height: 56px;

  ${({ theme }) => theme.media.small`
    display: block;
  `}
`

Home.getLayout = (page: JSX.Element) => {
  const FooterChildrenComponent = () => <FooterMargin />

  return <DefaultLayout FooterChildrenComponent={FooterChildrenComponent}>{page}</DefaultLayout>
}

export default Home
