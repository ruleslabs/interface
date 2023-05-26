import React, { useCallback, useEffect } from 'react'
import styled from 'styled-components/macro'
import { t } from '@lingui/macro'
import { useLocation } from 'react-router-dom'

import Section from 'src/components/Section'
import Column from 'src/components/Column'
import { TYPE } from 'src/styles/theme'
import Card from 'src/components/Card'
import HOMEPAGE from 'src/components/Homepage'
import DefaultLayout from 'src/components/Layout'
import { useAuthModalToggle, useClaimLiveRewardModalToggle } from 'src/state/application/hooks'
import { useSetAuthMode } from 'src/state/auth/hooks'
import { AuthMode } from 'src/state/auth/actions'
import { RowCenter } from 'src/components/Row'
import useCurrentUser from 'src/hooks/useCurrentUser'
import YoutubeEmbed from 'src/components/YoutubeEmbed'
import ClaimLiveRewardModal from 'src/components/LiveRewardModal/Claim'

import { ReactComponent as LogoOutline } from 'src/images/logo-outline.svg'

const BackgroundWrapper = styled(RowCenter)<{ large: boolean }>`
  position: relative;
  height: ${({ large }) => (large ? '80vh' : '40vh')};
  width: 100%;
  justify-content: center;

  & > * {
    position: absolute;
    width: 100%;
    height: ${({ large }) => (large ? '80vh' : '40vh')};
  }

  & > video {
    object-fit: cover;
  }
`

const TrailerYoutubeEmbed = styled(YoutubeEmbed)`
  width: 720px;
  display: block;
  height: unset;
  transform: translateY(-64px);

  ${({ theme }) => theme.media.small`
    width: 100%;
    padding: 0 16px;
  `}
`

const LogoOutlineWrapper = styled(RowCenter)<{ windowHeight?: number }>`
  justify-content: center;
  position: absolute;
  mix-blend-mode: overlay;

  & svg {
    width: 80%;
    max-width: 1024px;
    transform: translateY(-32px);
    fill: ${({ theme }) => theme.white};

    #logo-outline-ru {
      animation: flicker 5s linear infinite;
    }

    #logo-outline-e1,
    #logo-outline-e2,
    #logo-outline-e3 {
      animation: flicker 3s linear infinite;
    }

    @keyframes flicker {
      0%,
      19.999%,
      22%,
      62.999%,
      64%,
      64.999%,
      70%,
      100% {
        opacity: 0.99;
      }

      20%,
      21.999%,
      63%,
      63.999%,
      65%,
      69.999% {
        opacity: 0.4;
      }
    }
  }
`

const BackgroundVideoGradient = styled.div`
  background: ${({ theme }) => `linear-gradient(0deg, ${theme.bg1} 0, ${theme.bg1}00 300px)`};
`

const StyledHome = styled(Section)`
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 32px;
  transform: translateY(-64px);

  ${({ theme }) => theme.media.small`
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
      <TYPE.large fontSize={32}>{title}</TYPE.large>
      {children}
    </Column>
  )
}

function Home() {
  // router
  const query = new URLSearchParams(useLocation().search)

  // current user
  const { currentUser } = useCurrentUser()

  // modal
  const toggleAuthModal = useAuthModalToggle()
  const setAuthMode = useSetAuthMode()
  const toggleClaimLiveRewardModal = useClaimLiveRewardModalToggle()

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
    switch (query.get('action')) {
      case 'update-password':
        togglePasswordUpdateModal()
        break

      case 'remove-2fa':
        toggleTwoFactorAuthSecretRemovalModal()
        break

      case 'claim-live-reward':
        toggleClaimLiveRewardModal()
    }
  }, [])

  return (
    <>
      <BackgroundWrapper large={!currentUser}>
        <video src="https://videos.rules.art/mp4/homepage.mp4" playsInline loop autoPlay muted />

        <BackgroundVideoGradient />

        {currentUser ? (
          <LogoOutlineWrapper>
            <LogoOutline />
          </LogoOutlineWrapper>
        ) : (
          <TrailerYoutubeEmbed embedId="m0lYtWPhJVo" />
        )}
      </BackgroundWrapper>

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

      <ClaimLiveRewardModal />
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

Home.withLayout = () => (
  <DefaultLayout FooterChildrenComponent={() => <FooterMargin />}>
    <Home />
  </DefaultLayout>
)

export default Home
