import React, { useCallback, useState } from 'react'
import styled, { css } from 'styled-components'
import { Trans } from '@lingui/macro'

import { useCurrentUser } from '@/state/user/hooks'
import Modal from '@/components/Modal'
import { NavLink, NavLinkProps, NavButton } from '@/components/NavLink'
import Column from '@/components/Column'
import { useNavModalToggle, useModalOpen, useAuthModalToggle } from '@/state/application/hooks'
import { useSetAuthMode } from '@/state/auth/hooks'
import { AuthMode } from '@/state/auth/actions'
import { ApplicationModal } from '@/state/application/actions'
import { BackButton } from '@/components/Button'
import Settings from '@/components/SettingsModal/Settings'
import LanguageSelector from '@/components/LanguageSelector'
import { SecondaryButton, PrimaryButton } from '@/components/Button'
import { menuLinks } from '@/components/Header'

const StyledNavModal = styled.div`
  margin-top: 62px;
  height: calc(100% - 62px);
  width: 280px;
  background: ${({ theme }) => theme.bg2};
  position: relative;
`

const NavWrapper = styled(Column)`
  position: absolute;
  top: 18px;
  bottom: 18px;
  left: 18px;
  right: 18px;
`

const NavLinkButtonStyle = css`
  width: 100%;
  padding: 14px 12px;
  font-size: 1rem;
  height: fit-content;
`

const StyledNavLink = styled(NavLink)`
  ${NavLinkButtonStyle}
`

const StyledNavButton = styled(NavButton)`
  ${NavLinkButtonStyle}
`

const StyledLanguageSelector = styled(LanguageSelector)`
  margin: 16px 0;
`

const CustomNavLink = (props: NavLinkProps) => {
  const toggleNavModal = useNavModalToggle()

  return <StyledNavLink onClick={toggleNavModal} {...props} />
}

interface SettingsProps extends React.HTMLAttributes<HTMLDivElement> {
  dispatch: () => void
}

const CustomSettings = ({ dispatch, ...props }: SettingsProps) => {
  const toggleNavModal = useNavModalToggle()

  return (
    <Column gap={24} {...props}>
      <BackButton onClick={dispatch} style={{ padding: '12px 0' }} />
      <Settings dispatch={toggleNavModal} />
    </Column>
  )
}

const StyledSettings = styled(CustomSettings)`
  padding-left: 12px;
`

export default function NavModal() {
  const currentUser = useCurrentUser()

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const toggleSettings = useCallback(() => setIsSettingsOpen(!isSettingsOpen), [isSettingsOpen])

  const toggleNavModal = useNavModalToggle()
  const isOpen = useModalOpen(ApplicationModal.NAV)

  // Auth modal
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
    <Modal onDismiss={toggleNavModal} isOpen={isOpen} sidebar>
      <StyledNavModal>
        <NavWrapper gap={16}>
          {isSettingsOpen && currentUser ? (
            <StyledSettings dispatch={toggleSettings} />
          ) : (
            <>
              {currentUser && <CustomNavLink href={`/user/${currentUser.slug}`}>{currentUser.username}</CustomNavLink>}

              {menuLinks.map((menuLink, index: number) => (
                <Trans
                  key={`nav-link-${index}`}
                  id={menuLink.name}
                  render={({ translation }) => (
                    <CustomNavLink href={menuLink.link} onClick={toggleNavModal}>
                      {translation}
                    </CustomNavLink>
                  )}
                />
              ))}

              {currentUser ? (
                <StyledNavButton onClick={toggleSettings}>
                  <Trans>Settings</Trans>
                </StyledNavButton>
              ) : (
                <>
                  <div style={{ margin: 'auto' }} />
                  <Column gap={18}>
                    <PrimaryButton onClick={toggleSignInModal}>Sign in</PrimaryButton>
                    <SecondaryButton onClick={toggleSignUpModal}>Sign up</SecondaryButton>
                  </Column>
                </>
              )}
            </>
          )}

          {currentUser && <div style={{ margin: 'auto' }} />}

          <StyledLanguageSelector />
        </NavWrapper>
      </StyledNavModal>
    </Modal>
  )
}
