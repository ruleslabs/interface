import React, { useCallback } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import { WeiAmount } from '@rulesorg/sdk-core'

import { useCurrentUser, useSetCurrentUser } from '@/state/user/hooks'
import {
  useAuthModalToggle,
  useNavModalUserDesktopToggle,
  useNavModalUserMobileToggle,
  useWalletModalToggle,
} from '@/state/application/hooks'
import { useSetAuthMode } from '@/state/auth/hooks'
import { AuthMode } from '@/state/auth/actions'
import AuthModal from '@/components/AuthModal'
import { IconButton, PrimaryButton, SecondaryButton } from '@/components/Button'
import WalletModal from '@/components/WalletModal'
import WalletUpgradeModal from '@/components/WalletUpgradeModal'
import { TYPE } from '@/styles/theme'
import { useETHBalances } from '@/state/wallet/hooks'
import Avatar from '@/components/Avatar'
import NavModalUserDesktop from '@/components/NavModal/UserDesktop'
import NavModalUserMobile from '@/components/NavModal/UserMobile'

import BellIcon from '@/images/bell.svg'
import WalletIcon from '@/images/wallet.svg'

const StyledAccountStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  height: 100%;

  ${({ theme }) => theme.media.small`
    gap: 16px;
    flex-direction row-reverse;

    & ${IconButton} {
      border: none;
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
  padding: 8px;
`

const SignInButton = styled(SecondaryButton)`
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
  padding: 8px 12px;
  color: ${({ theme }) => theme.bg1};
  background-color: ${({ theme }) => theme.white};
`

const AvatarWrapper = styled.div`
  height: 38px;
  width: 38px;
  padding: 2px;
  border: 1px solid ${({ theme }) => theme.bg3}80;
  border-radius: 50%;
  transition: border-color 100ms;

  img {
    width: 100%;
    height: 100%;
  }

  &.active,
  &:hover {
    border-color: ${({ theme }) => theme.text1};
  }
`

const WalletButton = styled(PrimaryButton)<{ alert: boolean }>`
  width: unset;
  padding: 0 16px;
  height: 38px;
  border-radius: 4px;

  ${({ theme }) => theme.media.medium`
    padding: 0 12px;
  `}

  ${({ theme }) => theme.media.small`
    display: none;
  `}

  ${({ theme, alert }) =>
    !!alert &&
    theme.before.alert`
      ::before {
        top: -4px;
      }
    `}
`

const AvatarButtonWrapperDesktop = styled.div`
  position: relative;
  cursor: pointer;

  ${({ theme }) => theme.media.medium`
    display: none;
  `}
`

const AvatarButtonWrapperMobile = styled.div`
  position: relative;
  cursor: pointer;
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
  const currentUser = useCurrentUser()

  // modal
  const toggleWalletModal = useWalletModalToggle()

  // nav modal
  const toggleNavModalUserDesktop = useNavModalUserDesktopToggle()
  const toggleNavModalUserMobile = useNavModalUserMobileToggle()

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
  const setCurrentUser = useSetCurrentUser()
  const onSuccessfulWalletUpgrade = useCallback(
    () => setCurrentUser({ ...currentUser, starknetWallet: { ...currentUser.starknetWallet, needsUpgrade: false } }),
    [setCurrentUser, currentUser]
  )

  // ETH balance
  let balance = useETHBalances([currentUser?.starknetWallet.address])[currentUser?.starknetWallet.address]
  balance = currentUser?.starknetWallet.address ? balance : WeiAmount.fromRawAmount(0)

  return (
    <>
      <StyledAccountStatus {...props}>
        {!!currentUser ? (
          <>
            {currentUser?.starknetWallet.address && (
              <WalletButton onClick={toggleWalletModal} alert={!!currentUser?.starknetWallet.lockingReason}>
                <TYPE.body fontWeight={500}>{balance ? `${balance.toFixed(4)} ETH` : 'Loading...'}</TYPE.body>
              </WalletButton>
            )}

            <AvatarButtonWrapperDesktop onClick={toggleNavModalUserDesktop}>
              <AvatarWrapper>
                <Avatar src={currentUser.profile.pictureUrl} fallbackSrc={currentUser.profile.fallbackSrc} />
              </AvatarWrapper>

              <NavModalUserDesktop />
            </AvatarButtonWrapperDesktop>

            <AvatarButtonWrapperMobile onClick={toggleNavModalUserMobile}>
              <AvatarWrapper>
                <Avatar src={currentUser.profile.pictureUrl} fallbackSrc={currentUser.profile.fallbackSrc} />
              </AvatarWrapper>

              <NavModalUserMobile />
            </AvatarButtonWrapperMobile>

            {currentUser?.starknetWallet.address && (
              <MobileIconButton onClick={toggleWalletModal} alert={!!currentUser?.starknetWallet.lockingReason}>
                <WalletIcon />
              </MobileIconButton>
            )}

            <IconButton notifications={3}>
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
      <AuthModal />
    </>
  )
}
