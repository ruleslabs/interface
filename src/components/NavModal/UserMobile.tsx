import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { useSidebarModalOpened, useNavModalUserMobileToggle, useWalletModalToggle } from '@/state/application/hooks'
import { ApplicationSidebarModal } from '@/state/application/actions'
import { TYPE } from '@/styles/theme'
import { useCurrentUser } from '@/state/user/hooks'
import SidebarModal, { ModalHeader, ModalBody, ModalContent } from '@/components/Modal/Sidebar'
import { SidebarNavButton } from '@/components/Button'
import { useNavUserLinks, NavUserSublinks } from '@/hooks/useNav'
import Actionable from '../Actionable'
import Divider from '@/components/Divider'
import Column from '@/components/Column'
import { RowCenter } from '@/components/Row'
import { ActiveLink } from '@/components/Link'
import WalletBalanceButton from '@/components/AccountStatus/WalletBalanceButton'
import NavProfile from './NavProfile'

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
            <Trans id={navLink.name} render={({ translation }) => <>{translation}</>} />
          </SidebarNavButton>
        </Actionable>
      ))}
    </Column>
  )
}

export default function NavModalUserMobile() {
  // current user
  const currentUser = useCurrentUser()

  // modal
  const toggleNavModalUserMobile = useNavModalUserMobileToggle()
  const isOpen = useSidebarModalOpened(ApplicationSidebarModal.NAV_USER_MOBILE)

  // wallet modal
  const toggleWalletModal = useWalletModalToggle()

  // nav links
  const navLinks = useNavUserLinks(currentUser.slug)

  if (!currentUser) return null

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
              <Trans>Your wallet</Trans>
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
