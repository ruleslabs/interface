import React, { useCallback } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { ActiveLink } from '@/components/Link'
import { useCurrentUser, useSetCurrentUser } from '@/state/user/hooks'
import { useSettingsModalToggle, useAuthModalToggle } from '@/state/application/hooks'
import { useSetAuthMode } from '@/state/auth/hooks'
import { AuthMode } from '@/state/auth/actions'
import Settings from '@/images/settings.svg'
import SettingsModal from '@/components/SettingsModal'
import AuthModal from '@/components/AuthModal'
import { PrimaryButton, SecondaryButton, IconButton, NavButton } from '@/components/Button'
import DepositModal from '@/components/DepositModal'
import WithdrawModal from '@/components/WithdrawModal'
import WalletUpgradeModal from '@/components/WalletUpgradeModal'
import useNeededActions from '@/hooks/useNeededActions'

const RotatingIconButton = styled(IconButton)`
  & svg {
    transition: transform 100ms ease-out;
  }

  &:hover svg {
    transform: rotate(45deg);
  }
`

const StyledAccountStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  height: 100%;

  a {
    height: 100%;
  }
`

export default function AccountStatus(props: React.HTMLAttributes<HTMLDivElement>) {
  // current user
  const currentUser = useCurrentUser()

  // needed actions
  const neededActions = useNeededActions()

  // modal
  const toggleSettingsModal = useSettingsModalToggle()

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

  return (
    <>
      <StyledAccountStatus {...props}>
        {!!currentUser ? (
          <>
            <ActiveLink href={`/user/${currentUser.slug}`}>
              <NavButton>{currentUser.username}</NavButton>
            </ActiveLink>

            <RotatingIconButton
              onClick={toggleSettingsModal}
              alert={currentUser?.starknetWallet.needsSignerPublicKeyUpdate}
              notifications={neededActions.total}
            >
              <Settings />
            </RotatingIconButton>
          </>
        ) : (
          <>
            <PrimaryButton onClick={toggleSignInModal}>
              <Trans>Sign in</Trans>
            </PrimaryButton>
            <SecondaryButton onClick={toggleSignUpModal}>
              <Trans>Sign up</Trans>
            </SecondaryButton>
          </>
        )}
      </StyledAccountStatus>

      <SettingsModal currentUser={currentUser} />
      <DepositModal />
      <WithdrawModal />
      <WalletUpgradeModal onSuccess={onSuccessfulWalletUpgrade} />
      <AuthModal />
    </>
  )
}
