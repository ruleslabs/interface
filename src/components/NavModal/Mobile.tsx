import React, { useCallback } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { ActiveLink } from '@/components/Link'
import { useCurrentUser } from '@/state/user/hooks'
import SidebarModal from '@/components/Modal/Sidebar'
import { RowCenter } from '@/components/Row'
import Column from '@/components/Column'
import { useNavModalMobileToggle, useModalOpen, useAuthModalToggle } from '@/state/application/hooks'
import { useSetAuthMode } from '@/state/auth/hooks'
import { AuthMode } from '@/state/auth/actions'
import { ApplicationModal } from '@/state/application/actions'
import LanguageSelector from '@/components/LanguageSelector'
import { SecondaryButton, PrimaryButton, NavButton } from '@/components/Button'
import { menuLinks } from '@/components/Header'
import useWindowSize from '@/hooks/useWindowSize'

import ExternalLinkIcon from '@/images/external-link.svg'

const StyledExternalLinkIcon = styled(ExternalLinkIcon)`
  width: 12px;
  height: 12px;
  fill: ${({ theme }) => theme.text2};
`

const StyledNavModalMobile = styled.div<{ windowHeight?: number }>`
  margin-top: ${({ theme }) => theme.size.headerHeightMedium}px;
  height: ${({ theme, windowHeight = 0 }) => windowHeight - theme.size.headerHeightMedium}px;
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

const StyledNavButton = styled(NavButton)`
  width: 100%;
  height: fit-content;
  padding: 16px 12px;
`

const StyledLanguageSelector = styled(LanguageSelector)`
  margin: 16px 0;
`

const Notifiable = styled.div<{ notifications?: number }>`
  height: 100%;

  ${({ theme, notifications = 0 }) =>
    notifications &&
    theme.before.notifications`
      ::before {
        top: -1px;
        right: -24px;
      }
    `}
`

export default function NavModalMobile() {
  const currentUser = useCurrentUser()

  const toggleNavModalMobile = useNavModalMobileToggle()
  const isOpen = useModalOpen(ApplicationModal.NAV_MOBILE)

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

  // window size
  const windowSize = useWindowSize()

  return (
    <SidebarModal onDismiss={toggleNavModalMobile} isOpen={isOpen}>
      <StyledNavModalMobile windowHeight={windowSize.height}>
        <NavWrapper gap={16}>
          {currentUser && (
            <ActiveLink href={`/user/${currentUser.slug}`} onClick={toggleNavModalMobile}>
              <StyledNavButton>{currentUser.username}</StyledNavButton>
            </ActiveLink>
          )}

          {menuLinks.map((menuLink) => (
            <ActiveLink
              key={menuLink.link}
              href={menuLink.link}
              onClick={toggleNavModalMobile}
              target={menuLink.external ? '_blank' : undefined}
            >
              <StyledNavButton>
                <RowCenter gap={4}>
                  <Trans id={menuLink.name} render={({ translation }) => <>{translation}</>} />

                  {menuLink.external && <StyledExternalLinkIcon />}
                </RowCenter>
              </StyledNavButton>
            </ActiveLink>
          ))}

          <div style={{ margin: 'auto' }} />

          <Column gap={18}>
            <PrimaryButton onClick={toggleSignInModal}>Sign in</PrimaryButton>
            <SecondaryButton onClick={toggleSignUpModal}>Sign up</SecondaryButton>
          </Column>

          <StyledLanguageSelector />
        </NavWrapper>
      </StyledNavModalMobile>
    </SidebarModal>
  )
}
