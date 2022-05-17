import React, { useCallback } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { useCurrentUser } from '@/state/user/hooks'
import { NavLink } from '@/components/NavLink'
import { useSettingsModalToggle, useAuthModalToggle } from '@/state/application/hooks'
import { useSetAuthMode } from '@/state/auth/hooks'
import { AuthMode } from '@/state/auth/actions'
import Settings from '@/images/settings.svg'
import SettingsModal from '@/components/SettingsModal'
import AuthModal from '@/components/AuthModal'
import { PrimaryButton, SecondaryButton, IconButton } from '@/components/Button'
import DepositModal from '@/components/DepositModal'

const StyledAccountStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  height: 100%;
`

export default function AccountStatus(props: React.HTMLAttributes<HTMLDivElement>) {
  const currentUser = useCurrentUser()

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

  return (
    <>
      <StyledAccountStatus {...props}>
        {!!currentUser ? (
          <>
            <NavLink href={`/user/${currentUser.slug}`}>{currentUser.username}</NavLink>
            <IconButton onClick={toggleSettingsModal}>
              <Settings />
            </IconButton>
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
      <AuthModal />
    </>
  )
}
