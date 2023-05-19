import React, { useCallback } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import {
  useAuthModalToggle,
  useNavModalUserDesktopToggle,
  useNavModalUserMobileToggle,
  useNotificationsModalToggle,
  useWalletModalToggle,
} from '@/state/application/hooks'
import { useSetAuthMode } from '@/state/auth/hooks'
import { AuthMode } from '@/state/auth/actions'
import AuthModal from '@/components/AuthModal'
import { IconButton, PrimaryButton, SecondaryButton } from '@/components/Button'
import WalletModal from '@/components/WalletModal'
import WalletUpgradeModal from '@/components/WalletUpgradeModal'
import Avatar from '@/components/Avatar'
import NavModalUserDesktop from '@/components/NavModal/UserDesktop'
import NavModalUserMobile from '@/components/NavModal/UserMobile'
import NotificationsModal from '@/components/NotificationsModal'

import BellIcon from '@/images/bell.svg'
import WalletIcon from '@/images/wallet.svg'
import WalletBalanceButton from './WalletBalanceButton'
import useCurrentUser from '@/hooks/useCurrentUser'

const StyledAccountStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  height: 100%;

  ${({ theme }) => theme.media.small`
    gap: 28px;
    flex-direction row-reverse;

    & ${IconButton} {
      border: none;
      border-radius: 0;
      background: none;
      width: fit-content;
      height: fit-content;
    }
  `}
`

const SignUpButton = styled(PrimaryButton)`
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
  padding: 8px 12px;
`

const SignInButton = styled(SecondaryButton)`
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.text2};

  &:hover {
    border-color: ${({ theme }) => theme.text1};
  }
`

const StyledWalletBalanceButton = styled(WalletBalanceButton)`
  ${({ theme }) => theme.media.small`
    display: none;
  `}
`

const AvatarWrapper = styled.div`
  height: 38px;
  width: 38px;
  padding: 2px;
  border: 1px solid ${({ theme }) => theme.bg3}80;
  border-radius: 50%;
  transition: border-color 100ms;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
  }

  &.active,
  &:hover {
    border-color: ${({ theme }) => theme.text1};
  }
`

const AvatarButtonWrapperDesktop = styled.div`
  position: relative;

  ${({ theme }) => theme.media.medium`
    display: none;
  `}
`

const AvatarButtonWrapperMobile = styled.div`
  position: relative;
  display: none;

  ${({ theme }) => theme.media.medium`
    display: unset;
  `}
`

const MobileIconButton = styled(IconButton)`
  display: none;

  ${({ theme }) => theme.media.small`
    display: unset
  `}
`

export default function AccountStatus(props: React.HTMLAttributes<HTMLDivElement>) {
  // current user
  const { currentUser, setCurrentUser } = useCurrentUser()

  // modal
  const toggleWalletModal = useWalletModalToggle()

  // nav modal
  const toggleNavModalUserDesktop = useNavModalUserDesktopToggle()
  const toggleNavModalUserMobile = useNavModalUserMobileToggle()

  // notifications modal
  const toggleNotificationsModal = useNotificationsModalToggle()

  // auth modal
  const toggleAuthModal = useAuthModalToggle()
  const setAuthMode = useSetAuthMode()

  const toggleAuthModalWithMode = useCallback(
    (authMode: AuthMode) => {
      setAuthMode(authMode)
      toggleAuthModal()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toggleAuthModal]
  )
  const toggleSignInModal = () => toggleAuthModalWithMode(AuthMode.SIGN_IN)
  const toggleSignUpModal = () => toggleAuthModalWithMode(AuthMode.SIGN_UP)

  // wallet upgrade
  const onSuccessfulWalletUpgrade = useCallback(
    () =>
      setCurrentUser((currentUser) => {
        if (!currentUser) return
        currentUser.starknetWallet.needsUpgrade = false
      }),
    [setCurrentUser, currentUser]
  )

  return (
    <>
      <StyledAccountStatus {...props}>
        {!!currentUser ? (
          <>
            {currentUser?.starknetWallet.address && <StyledWalletBalanceButton onClick={toggleWalletModal} />}

            <AvatarButtonWrapperDesktop>
              <AvatarWrapper onClick={toggleNavModalUserDesktop}>
                <Avatar src={currentUser.profile.pictureUrl} fallbackSrc={currentUser.profile.fallbackUrl} />
              </AvatarWrapper>

              <NavModalUserDesktop />
            </AvatarButtonWrapperDesktop>

            <AvatarButtonWrapperMobile>
              <AvatarWrapper onClick={toggleNavModalUserMobile}>
                <Avatar src={currentUser.profile.pictureUrl} fallbackSrc={currentUser.profile.fallbackUrl} />
              </AvatarWrapper>

              <NavModalUserMobile />
            </AvatarButtonWrapperMobile>

            {currentUser?.starknetWallet.address && (
              <MobileIconButton onClick={toggleWalletModal} alert={!!currentUser?.starknetWallet.lockingReason}>
                <WalletIcon />
              </MobileIconButton>
            )}

            <IconButton notifications={currentUser.unreadNotificationsCount} onClick={toggleNotificationsModal}>
              <BellIcon />
            </IconButton>
          </>
        ) : (
          <>
            <SignInButton onClick={toggleSignInModal}>
              <Trans>SIGN IN</Trans>
            </SignInButton>

            <SignUpButton onClick={toggleSignUpModal}>
              <Trans>SIGN UP</Trans>
            </SignUpButton>
          </>
        )}
      </StyledAccountStatus>

      <WalletModal />
      <WalletUpgradeModal onSuccess={onSuccessfulWalletUpgrade} />
      <NotificationsModal />
      <AuthModal />
    </>
  )
}
