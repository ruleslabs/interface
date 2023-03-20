import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { useModalOpen, useNavModalUserMobileToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { TYPE } from '@/styles/theme'
import { ActiveLink } from '@/components/Link'
import { useCurrentUser, useLogout } from '@/state/user/hooks'
import SidebarModal, { ModalHeader, ModalBody } from '@/components/Modal/Sidebar'
import useWindowSize from '@/hooks/useWindowSize'
import { NAV_USER_LINKS } from '@/constants/nav'
import { SidebarNavButton } from '@/components/Button'

const StyledNavModalUserMobile = styled.div<{ windowHeight?: number }>`
  height: ${({ windowHeight = 0 }) => windowHeight}px;
  width: 280px;
  background: ${({ theme }) => theme.bg1};
  position: relative;
  width: 280px;
`

const UsernameMenuButton = styled(TYPE.body)`
  width: 100%;
  font-weight: 500;
  font-size: 18px;
  text-align: center;
  padding: 6px 8px 6px 16px;
  cursor: pointer;

  &.active {
    background: ${({ theme }) => theme.bg3}40;
  }
`

const StyledHr = styled.div`
  margin: 6px 0;
  background: ${({ theme }) => theme.bg3};
  height: 1px;
  width: 100%;
`

export default function NavModalUserMobile() {
  // current user
  const currentUser = useCurrentUser()

  // modal
  const toggleNavModalUserMobile = useNavModalUserMobileToggle()
  const isOpen = useModalOpen(ApplicationModal.NAV_USER_MOBILE)

  // window size
  const windowSize = useWindowSize()

  // logout
  const logout = useLogout()

  if (!currentUser) return null

  return (
    <SidebarModal onDismiss={toggleNavModalUserMobile} isOpen={isOpen} position="right">
      <StyledNavModalUserMobile windowHeight={windowSize.height}>
        <ModalHeader onDismiss={toggleNavModalUserMobile} />

        <ModalBody>
          <ActiveLink href={`/user/${currentUser.slug}`} perfectMatch>
            <UsernameMenuButton>
              <Trans>{currentUser.username}</Trans>
            </UsernameMenuButton>
          </ActiveLink>

          <StyledHr />

          {NAV_USER_LINKS.map((navLinks) => (
            <>
              {navLinks.map((navLink) => (
                <ActiveLink key={navLink.name} href={navLink.link.replace('{slug}', currentUser.slug)} perfectMatch>
                  <SidebarNavButton>
                    <Trans id={navLink.name} render={({ translation }) => <>{translation}</>} />
                  </SidebarNavButton>
                </ActiveLink>
              ))}

              <StyledHr />
            </>
          ))}

          <SidebarNavButton>
            <Trans>Upgrade wallet</Trans>
          </SidebarNavButton>

          <StyledHr />

          <SidebarNavButton onClick={logout}>Logout</SidebarNavButton>
        </ModalBody>
      </StyledNavModalUserMobile>
    </SidebarModal>
  )
}
