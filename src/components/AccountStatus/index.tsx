import React, { useCallback } from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'

import {
  useAuthModalToggle,
  useNavModalUserDesktopToggle,
  useNavModalUserMobileToggle,
  useNotificationsModalToggle,
  useWalletModalToggle,
} from 'src/state/application/hooks'
import { useSetAuthMode } from 'src/state/auth/hooks'
import { AuthMode } from 'src/state/auth/actions'
import AuthModal from 'src/components/AuthModal'
import { IconButton, PrimaryButton, SecondaryButton } from 'src/components/Button'
import WalletModal from 'src/components/WalletModal'
import WalletUpgradeModal from 'src/components/WalletUpgradeModal'
import Avatar from 'src/components/Avatar'
import NavModalUserDesktop from 'src/components/NavModal/UserDesktop'
import NavModalUserMobile from 'src/components/NavModal/UserMobile'
import NotificationsModal from 'src/components/NotificationsModal'

import { ReactComponent as BellIcon } from 'src/images/bell.svg'
import { ReactComponent as WalletIcon } from 'src/images/wallet.svg'
import WalletBalanceButton from './WalletBalanceButton'
import useCurrentUser from 'src/hooks/useCurrentUser'

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
  const { currentUser } = useCurrentUser()

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
              <MobileIconButton onClick={toggleWalletModal} $alert={!!currentUser?.starknetWallet.lockingReason}>
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
      <WalletUpgradeModal />
      <NotificationsModal />
      <AuthModal />
    </>
  )
}
