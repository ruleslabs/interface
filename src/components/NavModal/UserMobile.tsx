import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { useModalOpen, useNavModalUserMobileToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { TYPE } from '@/styles/theme'
import { ActiveLink } from '@/components/Link'
import { useCurrentUser } from '@/state/user/hooks'
import SidebarModal, { ModalHeader, ModalBody, ModalContent } from '@/components/Modal/Sidebar'
import { SidebarNavButton } from '@/components/Button'
import { useNavUserLinks } from '@/hooks/useNav'
import Actionable from './Actionable'
import Divider from '@/components/Divider'
import Column from '@/components/Column'

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

export default function NavModalUserMobile() {
  // current user
  const currentUser = useCurrentUser()

  // modal
  const toggleNavModalUserMobile = useNavModalUserMobileToggle()
  const isOpen = useModalOpen(ApplicationModal.NAV_USER_MOBILE)

  // nav links
  const navLinks = useNavUserLinks(currentUser.slug)

  if (!currentUser) return null

  return (
    <SidebarModal onDismiss={toggleNavModalUserMobile} isOpen={isOpen} position="right">
      <ModalContent>
        <ModalHeader onDismiss={toggleNavModalUserMobile} />

        <ModalBody gap={6}>
          <ActiveLink href={`/user/${currentUser.slug}`} perfectMatch>
            <UsernameMenuButton>
              <Trans>{currentUser.username}</Trans>
            </UsernameMenuButton>
          </ActiveLink>

          {navLinks.map((navLinks, index) => (
            <Column key={`nav-links-${index}`} gap={6}>
              <Divider />

              <Column>
                {navLinks.map((navLink) => (
                  <Actionable key={navLink.name} link={navLink.link} handler={navLink.handler} perfectMatch>
                    <SidebarNavButton>
                      <Trans id={navLink.name} render={({ translation }) => <>{translation}</>} />
                    </SidebarNavButton>
                  </Actionable>
                ))}
              </Column>
            </Column>
          ))}
        </ModalBody>
      </ModalContent>
    </SidebarModal>
  )
}
