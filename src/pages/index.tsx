import React, { useCallback, useEffect } from 'react'
import styled, { css } from 'styled-components'
import { t, Trans } from '@lingui/macro'
import { useRouter } from 'next/router'

import useTheme from '@/hooks/useTheme'
import { useCurrentUser } from '@/state/user/hooks'
import Section from '@/components/Section'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import Card from '@/components/Card'
import HOMEPAGE from '@/components/Homepage'
import DefaultLayout from '@/components/Layout'
import { useHomepageTab, useSetHomepageTab } from '@/state/application/hooks'
import { HomepageTabs, HomepageTabKey } from '@/state/application/actions'
import YoutubeEmbed from '@/components/YoutubeEmbed'
import { PrimaryButton, IconButton } from '@/components/Button'
import { useAuthModalToggle } from '@/state/application/hooks'
import { useSetAuthMode } from '@/state/auth/hooks'
import { AuthMode } from '@/state/auth/actions'
import useWindowSize from '@/hooks/useWindowSize'

import ArrowIcon from '@/images/arrow.svg'

const BackgroundVideo = styled.video<{ windowHeight?: number }>`
  position: fixed;
  top: ${({ theme }) => theme.size.headerHeight}px;
  height: ${({ theme, windowHeight = 0 }) => windowHeight - theme.size.headerHeight}px;
  width: 100%;
  object-fit: cover;
  z-index: -1;
`

const LogoutSection = styled(Section)<{ windowHeight?: number }>`
  display: flex;
  flex-direction: column;
  height: ${({ theme, windowHeight = 0 }) => windowHeight - theme.size.headerHeight}px;
  padding-top: 8vh;
`

const StyledYoutubeEmbed = styled(YoutubeEmbed)`
  width: 720px;
  margin: 0 auto;
  display: block;
  ${({ theme }) => theme.media.medium`
    width: 680px;
  `}
  ${({ theme }) => theme.media.small`
    margin-top: 6vh;
    width: 360px;
  `}
  ${({ theme }) => theme.media.extraSmall`
    width: 100%;
  `}
`

const ActionButtonWrapper = styled.div`
  position: relative;
  margin: 32px auto 0;
  display: block;
  width: 250px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 6px 10px #00000040;
  ::before {
    content: '';
    position: absolute;
    z-index: 1;
    top: 2px;
    left: 6px;
    right: 6px;
    height: 12px;
    border-radius: 20px 20px 100px 100px / 14px 14px 30px 30px;
    background: linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0));
  }
`

const ActionButton = styled(PrimaryButton)`
  width: 100%;
  height: 55px;
`

const ScrollButton = styled(IconButton)`
  margin: auto auto 24px;
  background: ${({ theme }) => theme.bg3}80;
  width: 48px;
  height: 48px;

  & svg {
    transform: rotate(90deg);
  }

  ${({ theme }) => theme.media.small`
    margin-bottom: 80px;
  `}
`

const ParalaxBackground = styled.div<{ windowHeight?: number }>`
  position: absolute;
  background: ${({ theme }) => theme.bg1};
  top: ${({ windowHeight = 0 }) => windowHeight}px;
  bottom: -128px;
  left: 0;
  right: 0;
  z-index: -1;
`

const StyledHome = styled(Section)`
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 64px;

  ${({ theme }) => theme.media.small`
    margin-top: 32px;
  `}
`

const ActivableContent = css<{ active: boolean }>`
  ${({ theme, active }) => theme.media.small`
    ${!active && 'display: none;'}
  `}
`

const Aside = styled(Column)<{ active: boolean }>`
  ${ActivableContent}

  gap: 32px;
  flex: 0;

  & > div {
    width: 290px;
    min-width: 290px;
  }

  ${({ theme }) => theme.media.small`
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
    flex: 1;
  `}
`

const LastOffersColumn = styled(Column)<{ active: boolean }>`
  ${ActivableContent}

  flex: 1;
`

const StyledCard = styled(Card)`
  padding: 20px;
`

const TabSelectorWrapper = styled.div`
  display: none;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 8px 0;
  justify-content: center;
  background: ${({ theme }) => theme.bg2};
  box-shadow: 0 0 8px #00000080;
  z-index: 999;

  ${({ theme }) => theme.media.small`
    display: flex;
  `}
`

const TabSelectorActiveIndicator = styled.div<{ activeIndex: number }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  transform: translateX(${({ activeIndex }) => activeIndex * 100}%);
  background: ${({ theme }) => theme.primary1};
  border-radius: 3px;
  transition: transform 250ms ease-in-out;
`

const TabSelector = styled.div<{ length: number }>`
  display: grid;
  grid-template-columns: repeat(${({ length }) => length}, 1fr);
  background: ${({ theme }) => theme.bg1};
  border: solid 4px ${({ theme }) => theme.bg1};
  border-radius: 3px;
  position: relative;

  & ${TabSelectorActiveIndicator} {
    width: ${({ length }) => (length ? 100 / length : 0)}%;
  }
`

const TabSelectorButton = styled.button`
  background: none;
  border: none;
  padding: 8px 16px;
  color: ${({ theme }) => theme.text1};
  font-weight: 500;
  border-radius: 3px;
  z-index: 1;
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
  // homepage tab
  const activeHomepageTabKey = useHomepageTab()
  const setActiveHomepageTabKey = useSetHomepageTab()

  // router
  const router = useRouter()
  const { action } = router.query

  // current user
  const currentUser = useCurrentUser()

  // modal
  const toggleAuthModal = useAuthModalToggle()
  const setAuthMode = useSetAuthMode()

  const toggleSignUpModal = useCallback(() => {
    setAuthMode(AuthMode.SIGN_UP)
    toggleAuthModal()
  }, [toggleAuthModal, setAuthMode])

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

  // theme
  const theme = useTheme()

  // scroll button
  const handleScroll = useCallback(
    () => window?.scrollTo({ top: (windowSize.height ?? 0) - theme.size.headerHeight, behavior: 'smooth' }),
    [windowSize.height, theme.size.headerHeight]
  )

  return (
    <>
      {!currentUser && (
        <>
          <BackgroundVideo
            windowHeight={windowSize.height}
            src="https://videos.rules.art/mp4/homepage.mp4"
            playsInline
            loop
            autoPlay
            muted
          />

          <LogoutSection windowHeight={windowSize.height}>
            <StyledYoutubeEmbed embedId="m0lYtWPhJVo" />

            <ActionButtonWrapper>
              <ActionButton onClick={toggleSignUpModal} large>
                <Trans>Sign up</Trans>
              </ActionButton>
            </ActionButtonWrapper>

            <ScrollButton onClick={handleScroll}>
              <ArrowIcon />
            </ScrollButton>
          </LogoutSection>
        </>
      )}

      <ParalaxBackground windowHeight={windowSize.height} />

      <StyledHome>
        <Aside active={activeHomepageTabKey === 'aside'}>
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

        <LastOffersColumn active={activeHomepageTabKey === 'last-offers'}>
          <Article title={t`Last offers`}>
            <HOMEPAGE.LastOffers />
          </Article>
        </LastOffersColumn>

        <TabSelectorWrapper>
          <TabSelector length={Object.keys(HomepageTabs).length}>
            <TabSelectorActiveIndicator activeIndex={Object.keys(HomepageTabs).indexOf(activeHomepageTabKey)} />

            {(Object.keys(HomepageTabs) as HomepageTabKey[]).map((tabKey) => (
              <TabSelectorButton key={tabKey} onClick={() => setActiveHomepageTabKey(tabKey)}>
                <Trans id={HomepageTabs[tabKey]} render={({ translation }) => <>{translation}</>} />
              </TabSelectorButton>
            ))}
          </TabSelector>
        </TabSelectorWrapper>
      </StyledHome>
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
