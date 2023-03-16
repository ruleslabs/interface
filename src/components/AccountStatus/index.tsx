import React, { useCallback } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import { WeiAmount } from '@rulesorg/sdk-core'

import { ActiveLink } from '@/components/Link'
import { useCurrentUser, useSetCurrentUser } from '@/state/user/hooks'
import { useSettingsModalToggle, useAuthModalToggle, useWalletModalToggle } from '@/state/application/hooks'
import { useSetAuthMode } from '@/state/auth/hooks'
import { AuthMode } from '@/state/auth/actions'
import SettingsModal from '@/components/SettingsModal'
import AuthModal from '@/components/AuthModal'
import { PrimaryButton, SecondaryButton } from '@/components/Button'
import WalletModal from '@/components/WalletModal'
import WalletUpgradeModal from '@/components/WalletUpgradeModal'
import useNeededActions from '@/hooks/useNeededActions'
import { TYPE } from '@/styles/theme'
import { useETHBalances } from '@/state/wallet/hooks'

const ProfileButton = styled(SecondaryButton)`
  height: 42px;
  background: transparent;
  padding: 0 16px;
  border: 1px solid ${({ theme }) => theme.bg3};
  font-weight: 500;

  &.active,
  &:hover {
    background: ${({ theme }) => theme.bg3}80;
  }
`

const WalletButton = styled(SecondaryButton)`
  width: unset;
  padding: 0 16px;
  height: 42px;
  background: ${({ theme }) => theme.primary1}20;
  border: 1px solid ${({ theme }) => theme.primary1}80;
  border-radius: 3px;

  & * {
    color: ${({ theme }) => theme.primary1};
    font-size: 20px;
    font-weight: 700;
  }

  &.active,
  &:hover {
    background: ${({ theme }) => theme.primary1}40;
  }

  ${({ theme }) => theme.media.medium`
    padding: 0 12px;
  `}
`

const StyledAccountStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  height: 100%;

  ${({ theme }) => theme.media.medium`
    & > * {
      display: none;
    }

    & ${WalletButton} {
      display: unset;
    }
  `}
`

export default function AccountStatus(props: React.HTMLAttributes<HTMLDivElement>) {
  // current user
  const currentUser = useCurrentUser()

  // needed actions
  const neededActions = useNeededActions()

  // modal
  const toggleSettingsModal = useSettingsModalToggle()
  const toggleWalletModal = useWalletModalToggle()

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
            <ActiveLink href={`/user/${currentUser.slug}`}>
              <ProfileButton>{currentUser.username}</ProfileButton>
            </ActiveLink>

            {currentUser?.starknetWallet.address && (
              <WalletButton onClick={toggleWalletModal}>
                <TYPE.body>{balance ? `${balance.toFixed(6)} Ξ` : 'Loading...'}</TYPE.body>
              </WalletButton>
            )}
          </>
        ) : (
          <>
            <SecondaryButton onClick={toggleSignInModal}>
              <Trans>Sign in</Trans>
            </SecondaryButton>
            <PrimaryButton onClick={toggleSignUpModal}>
              <Trans>Sign up</Trans>
            </PrimaryButton>
          </>
        )}
      </StyledAccountStatus>

      <SettingsModal currentUser={currentUser} />
      <WalletModal />
      <WalletUpgradeModal onSuccess={onSuccessfulWalletUpgrade} />
      <AuthModal />
    </>
  )
}
