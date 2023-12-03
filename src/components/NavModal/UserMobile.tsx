import { Trans } from '@lingui/macro'
import { useCallback } from 'react'
import WalletBalanceButton from 'src/components/AccountStatus/WalletButton'
import Column from 'src/components/Column'
import Divider from 'src/components/Divider'
import { ActiveLink } from 'src/components/Link'
import SidebarModal, { ModalBody, ModalContent } from 'src/components/Modal/Sidebar'
import { RowCenter } from 'src/components/Row'
import useCurrentUser from 'src/hooks/useCurrentUser'
import { NavUserSublinks, useNavUserLinks } from 'src/hooks/useNav'
import { ApplicationModal, ApplicationSidebarModal } from 'src/state/application/actions'
import { useNavModalUserMobileToggle, useOpenModal, useSidebarModalOpened } from 'src/state/application/hooks'
import { WalletModalMode } from 'src/state/wallet/actions'
import { useSetWalletModalMode } from 'src/state/wallet/hooks'
import { TYPE } from 'src/styles/theme'
import styled from 'styled-components/macro'

import Actionable from '../Actionable'
import { ModalHeader } from '../Modal'
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
          <Trans id={navLink.name}>{navLink.name}</Trans>
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
  const openModal = useOpenModal(ApplicationModal.WALLET)
  const setWalletModalMode = useSetWalletModalMode()

  const openWalletModal = useCallback(() => {
    openModal()
    setWalletModalMode(WalletModalMode.OVERVIEW)
  }, [])

  // nav links
  const navLinks = useNavUserLinks(currentUser?.slug)

  if (!currentUser || !navLinks) return null

  return (
    <SidebarModal onDismiss={toggleNavModalUserMobile} isOpen={isOpen} position="right">
      <ModalContent>
        <ModalHeader onDismiss={toggleNavModalUserMobile} />

        <ModalBody gap="6">
          <ActiveLink href={`/user/${currentUser.slug}/cards`} perfectMatch>
            <NavProfile />
          </ActiveLink>

          <Divider />

          <WalletRow onClick={openWalletModal}>
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
