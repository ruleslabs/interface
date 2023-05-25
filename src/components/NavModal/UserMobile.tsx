import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'

import { useSidebarModalOpened, useNavModalUserMobileToggle, useWalletModalToggle } from 'src/state/application/hooks'
import { ApplicationSidebarModal } from 'src/state/application/actions'
import { TYPE } from 'src/styles/theme'
import useCurrentUser from 'src/hooks/useCurrentUser'
import SidebarModal, { ModalBody, ModalContent } from 'src/components/Modal/Sidebar'
import { SidebarNavButton } from 'src/components/Button'
import { useNavUserLinks, NavUserSublinks } from 'src/hooks/useNav'
import Actionable from '../Actionable'
import Divider from 'src/components/Divider'
import Column from 'src/components/Column'
import { RowCenter } from 'src/components/Row'
import { ActiveLink } from 'src/components/Link'
import WalletBalanceButton from 'src/components/AccountStatus/WalletBalanceButton'
import NavProfile from './NavProfile'
import { ModalHeader } from '../Modal'

const WalletRow = styled(RowCenter)`
  padding: 8px;
  justify-content: space-between;
`

interface NavUserSublinksMobileProps {
  navSublinks: NavUserSublinks
}

function NavUserSublinksMobile({ navSublinks }: NavUserSublinksMobileProps) {
  return (
    <Column>
      {navSublinks.links.map((navLink) => (
        <Actionable key={navLink.name} link={navLink.link} handler={navLink.handler} perfectMatch>
          <SidebarNavButton>
            <Trans id={navLink.name}>{navLink.name}</Trans>
          </SidebarNavButton>
        </Actionable>
      ))}
    </Column>
  )
}

export default function NavModalUserMobile() {
  // current user
  const { currentUser } = useCurrentUser()

  // modal
  const toggleNavModalUserMobile = useNavModalUserMobileToggle()
  const isOpen = useSidebarModalOpened(ApplicationSidebarModal.NAV_USER_MOBILE)

  // wallet modal
  const toggleWalletModal = useWalletModalToggle()

  // nav links
  const navLinks = useNavUserLinks(currentUser?.slug)

  if (!currentUser || !navLinks) return null

  return (
    <SidebarModal onDismiss={toggleNavModalUserMobile} isOpen={isOpen} position="right">
      <ModalContent>
        <ModalHeader onDismiss={toggleNavModalUserMobile} />

        <ModalBody gap={6}>
          <ActiveLink href={`/user/${currentUser.slug}`} perfectMatch>
            <NavProfile />
          </ActiveLink>

          <Divider />

          <WalletRow onClick={toggleWalletModal}>
            <TYPE.body fontWeight={500}>
              <Trans>My wallet</Trans>
            </TYPE.body>

            <WalletBalanceButton />
          </WalletRow>

          <Divider />

          <NavUserSublinksMobile navSublinks={navLinks.profile} />

          <Divider />

          <NavUserSublinksMobile navSublinks={navLinks.wallet} />

          <Divider />

          <NavUserSublinksMobile navSublinks={navLinks.misc} />
        </ModalBody>
      </ModalContent>
    </SidebarModal>
  )
}
