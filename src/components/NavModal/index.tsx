import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { ActiveLink } from '@/components/Link'
import { useCurrentUser } from '@/state/user/hooks'
import Modal from '@/components/Modal'
import { RowCenter } from '@/components/Row'
import Column from '@/components/Column'
import { useNavModalToggle, useModalOpen, useAuthModalToggle } from '@/state/application/hooks'
import { useSetAuthMode } from '@/state/auth/hooks'
import { AuthMode } from '@/state/auth/actions'
import { ApplicationModal } from '@/state/application/actions'
import { BackButton } from '@/components/Button'
import Settings from '@/components/SettingsModal/Settings'
import LanguageSelector from '@/components/LanguageSelector'
import { SecondaryButton, PrimaryButton, NavButton } from '@/components/Button'
import { menuLinks } from '@/components/Header'
import useNeededActions from '@/hooks/useNeededActions'
import useWindowSize from '@/hooks/useWindowSize'

import ExternalLinkIcon from '@/images/external-link.svg'

const StyledExternalLinkIcon = styled(ExternalLinkIcon)`
  width: 12px;
  height: 12px;
  fill: ${({ theme }) => theme.text2};
`

const StyledNavModal = styled.div<{ windowHeight?: number }>`
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

const StyledSettings = styled(Column)`
  gap: 24px;
  padding-left: 12px;
`

export default function NavModal() {
  const currentUser = useCurrentUser()

  // needed actions
  const neededActions = useNeededActions()

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

  // window size
  const windowSize = useWindowSize()

  return (
    <Modal onDismiss={toggleNavModal} isOpen={isOpen} sidebar>
      <StyledNavModal windowHeight={windowSize.height}>
        <NavWrapper gap={16}>
          {isSettingsOpen && currentUser ? (
            <StyledSettings>
              <BackButton onClick={toggleSettings} style={{ padding: '12px 0' }} />
              <Settings dispatch={toggleNavModal} />
            </StyledSettings>
          ) : (
            <>
              {currentUser && (
                <ActiveLink href={`/user/${currentUser.slug}`} onClick={toggleNavModal}>
                  <StyledNavButton>{currentUser.username}</StyledNavButton>
                </ActiveLink>
              )}

              {menuLinks.map((menuLink) => (
                <ActiveLink
                  key={menuLink.link}
                  href={menuLink.link}
                  onClick={toggleNavModal}
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

              {currentUser ? (
                <StyledNavButton onClick={toggleSettings} alert={currentUser?.starknetWallet.isLocked}>
                  <Trans>Settings</Trans>
                  <Notifiable notifications={neededActions.total} />
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
