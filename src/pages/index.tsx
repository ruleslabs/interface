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

const Video = styled.video`
  position: absolute;
  top: 57px;
  height: calc(100% - 57px + 128px); // 100% - header + footer
  width: 100%;
  object-fit: cover;
  z-index: -1;

  ${({ theme }) => theme.media.medium`
    top: 62px;
    height: calc(100% - 62px + 128px);
    object-position: left;
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

const SignUpButtonWrapper = styled.div`
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

const SignUpButton = styled(PrimaryButton)`
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

  // ?action
  useEffect(() => {
    switch (router.query.action) {
      case 'update-password':
        togglePasswordUpdateModal()
    }
  }, [])

  return (
    <>
      <Video src="https://videos.rules.art/mp4/homepage.mp4" playsInline loop autoPlay muted />
      <Section>
        <StyledYoutubeEmbed embedId="m0lYtWPhJVo" />
      </Section>
      {!currentUser && (
        <SignUpButtonWrapper>
          <SignUpButton onClick={toggleSignUpModal} large>
            <Trans>Sign up</Trans>
          </SignUpButton>
        </SignUpButtonWrapper>
      )}
    </>
  )
}
