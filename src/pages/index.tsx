import { useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import { useRouter } from 'next/router'

import { useCurrentUser } from '@/state/user/hooks'
import YoutubeEmbed from '@/components/YoutubeEmbed'
import { PrimaryButton } from '@/components/Button'
import { useAuthModalToggle } from '@/state/application/hooks'
import { useSetAuthMode } from '@/state/auth/hooks'
import { AuthMode } from '@/state/auth/actions'
import Section from '@/components/Section'
import Link from '@/components/Link'
import useWindowSize from '@/hooks/useWindowSize'

const Video = styled.video<{ windowHeight?: number }>`
  position: absolute;
  top: ${({ theme }) => theme.size.headerHeight}px;
  height: ${({ theme, windowHeight = 0 }) => windowHeight - theme.size.headerHeight}px;
  width: 100%;
  object-fit: cover;
  z-index: -1;

  ${({ theme, windowHeight = 0 }) => theme.media.medium`
    top: ${theme.size.headerHeightMedium};
    height: ${windowHeight - theme.size.headerHeightMedium}px;
    object-position: left;
  `}
`

const DesktopVideo = styled.video<{ windowHeight?: number }>`
  position: absolute;
  top: ${({ theme }) => theme.size.headerHeight}px;
  height: ${({ theme, windowHeight = 0 }) => windowHeight - theme.size.headerHeight}px;
  width: 100%;
  object-fit: cover;
  z-index: -1;

  ${({ theme }) => theme.media.medium`
    display: none;
  `}
`

const MobileVideo = styled.video<{ windowHeight?: number }>`
  position: absolute;
  top: ${({ theme }) => theme.size.headerHeightMedium}px;
  height: ${({ theme, windowHeight = 0 }) => windowHeight - theme.size.headerHeightMedium}px;
  width: 100%;
  object-fit: cover;
  z-index: -1;
  object-position: center;

  ${({ theme }) => theme.media.mediumGT`
    display: none;
  `}
`

const StyledYoutubeEmbed = styled(YoutubeEmbed)`
  width: 720px;
  margin: 8vh auto 0;
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

export default function Home() {
  const router = useRouter()
  const { action } = router.query

  const currentUser = useCurrentUser()

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

  return (
    <>
      <DesktopVideo
        windowHeight={windowSize.height}
        src="https://videos.rules.art/mp4/halloween-homepage-desktop.mp4"
        playsInline
        loop
        autoPlay
        muted
      />
      <MobileVideo
        windowHeight={windowSize.height}
        src="https://videos.rules.art/mp4/halloween-homepage-mobile.mp4"
        playsInline
        loop
        autoPlay
        muted
      />
    </>
  )

  return (
    <>
      <Video src="https://videos.rules.art/mp4/halloween-homepage.mp4" playsInline loop autoPlay muted />
      <Section>
        <StyledYoutubeEmbed embedId="m0lYtWPhJVo" />
      </Section>
      {currentUser?.nextPackToBuy?.slug ? (
        <Link href={`/pack/${currentUser.nextPackToBuy.slug}`}>
          <ActionButtonWrapper>
            <ActionButton large>
              <Trans>Buy a pack</Trans>
            </ActionButton>
          </ActionButtonWrapper>
        </Link>
      ) : (
        !currentUser && (
          <ActionButtonWrapper>
            <ActionButton onClick={toggleSignUpModal} large>
              <Trans>Sign up</Trans>
            </ActionButton>
          </ActionButtonWrapper>
        )
      )}
    </>
  )
}
