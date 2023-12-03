import { Trans } from '@lingui/macro'
import Column from 'src/components/Column'
import Divider from 'src/components/Divider'
import Link from 'src/components/Link'
import HintModal from 'src/components/Modal/Hint'
import useCurrentUser from 'src/hooks/useCurrentUser'
import { NavUserSublinks, useNavUserLinks } from 'src/hooks/useNav'
import { ApplicationModal } from 'src/state/application/actions'
import { useModalOpened, useNavModalUserDesktopToggle } from 'src/state/application/hooks'
import { TYPE } from 'src/styles/theme'
import styled from 'styled-components/macro'

import Actionable from '../Actionable'
import { TooltipCaret } from '../Tooltip'
import NavProfile from './NavProfile'

const StyledNavProfile = styled(NavProfile)`
  border-radius: 0;

  &:hover {
    background: ${({ theme }) => theme.bg3};
  }
`

const StyledNavModalUserDesktop = styled.div`
  z-index: 100;
  width: 200px;
  position: absolute;
  top: 50px;
  right: -16px;
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 6px;
  padding: 8px 0;
  box-shadow: 0 0 20px ${({ theme }) => theme.black}80;
`

const FillTooltipCaret = styled(TooltipCaret)`
  top: -3px;
  right: 40px;
  left: unset;

  svg {
    fill: ${({ theme }) => theme.bg2};
    width: 12px;
  }
`

const BorderTooltipCaret = styled(TooltipCaret)`
  top: -5px;
  right: 40px;
  left: unset;

  svg {
    fill: ${({ theme }) => theme.bg3};
    width: 12px;
  }
`

const MenuButton = styled(TYPE.body)`
  width: 100%;
  padding: 6px 8px 6px 16px;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.primary1};
  }
`

interface NavUserSublinksDesktopProps {
  navSublinks: NavUserSublinks
}

function NavUserSublinksDesktop({ navSublinks }: NavUserSublinksDesktopProps) {
  return (
    <Column>
      {navSublinks.links.map((navLink) => (
        <Actionable key={navLink.name} link={navLink.link} handler={navLink.handler}>
          <MenuButton>
            <Trans id={navLink.name}>{navLink.name}</Trans>
          </MenuButton>
        </Actionable>
      ))}
    </Column>
  )
}

export default function NavModalUserDesktop() {
  // current user
  const { currentUser } = useCurrentUser()

  // modal
  const toggleNavModalUserDesktop = useNavModalUserDesktopToggle()
  const isOpen = useModalOpened(ApplicationModal.NAV_USER_DESKTOP)

  // nav links
  const navLinks = useNavUserLinks(currentUser?.slug)

  if (!currentUser || !navLinks) return null

  return (
    <HintModal onDismiss={toggleNavModalUserDesktop} isOpen={isOpen}>
      <StyledNavModalUserDesktop>
        <BorderTooltipCaret direction="top" />
        <FillTooltipCaret direction="top" />

        <Column gap={6}>
          <Link href={`/user/${currentUser.slug}/cards`}>
            <StyledNavProfile />
          </Link>

          <Divider />

          <NavUserSublinksDesktop navSublinks={navLinks.profile} />

          <Divider />

          <NavUserSublinksDesktop navSublinks={navLinks.wallet} />

          <Divider />

          <NavUserSublinksDesktop navSublinks={navLinks.misc} />
        </Column>
      </StyledNavModalUserDesktop>
    </HintModal>
  )
}
