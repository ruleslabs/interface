import React, { useCallback, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import DefaultLayout from 'src/components/Layout'
import { RowCenter } from 'src/components/Row'
import useCurrentUser from 'src/hooks/useCurrentUser'
import { ReactComponent as LogoOutline } from 'src/images/logo-outline.svg'
import { useAuthModalToggle } from 'src/state/application/hooks'
import { AuthMode } from 'src/state/auth/actions'
import { useSetAuthMode } from 'src/state/auth/hooks'
import styled from 'styled-components/macro'

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

function Home() {
  // router
  const query = new URLSearchParams(useLocation().search)

  // current user
  const { currentUser } = useCurrentUser()

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
    switch (query.get('action')) {
      case 'update-password':
        togglePasswordUpdateModal()
        break

      case 'remove-2fa':
        toggleTwoFactorAuthSecretRemovalModal()
        break
    }
  }, [])

  return (
    <BackgroundWrapper large={!currentUser}>
      <video src="https://videos.rules.art/mp4/homepage.mp4" playsInline loop autoPlay muted />

      <BackgroundVideoGradient />

      <LogoOutlineWrapper>
        <LogoOutline />
      </LogoOutlineWrapper>
    </BackgroundWrapper>
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
