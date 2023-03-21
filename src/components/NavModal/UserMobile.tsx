import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { useModalOpen, useNavModalUserMobileToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { TYPE } from '@/styles/theme'
import { ActiveLink } from '@/components/Link'
import { useCurrentUser } from '@/state/user/hooks'
import SidebarModal, { ModalHeader, ModalBody } from '@/components/Modal/Sidebar'
import useWindowSize from '@/hooks/useWindowSize'
import { SidebarNavButton } from '@/components/Button'
import { useNavUserLinks } from '@/hooks/useNav'
import Actionable from './Actionable'

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

  // nav links
  const navLinks = useNavUserLinks(currentUser.slug)

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

          {navLinks.map((navLinks) => (
            <>
              <StyledHr />

              {navLinks.map((navLink) => (
                <Actionable key={navLink.name} link={navLink.link} handler={navLink.handler} perfectMatch>
                  <SidebarNavButton>
                    <Trans id={navLink.name} render={({ translation }) => <>{translation}</>} />
                  </SidebarNavButton>
                </Actionable>
              ))}
            </>
          ))}
        </ModalBody>
      </StyledNavModalUserMobile>
    </SidebarModal>
  )
}
