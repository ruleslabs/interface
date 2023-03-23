import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import HintModal from '@/components/Modal/Hint'
import { useModalOpen, useNavModalUserDesktopToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { TYPE } from '@/styles/theme'
import Column from '../Column'
import { TooltipCaret } from '../Tooltip'
import Link from '../Link'
import { useCurrentUser } from '@/state/user/hooks'
import { useNavUserLinks } from '@/hooks/useNav'
import Actionable from './Actionable'
import Divider from '@/components/Divider'

const StyledNavModalUserDesktop = styled.div`
  z-index: 100;
  width: 200px;
  position: absolute;
  top: 50px;
  right: -16px;
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 4px;
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

const UsernameMenuButton = styled(MenuButton)`
  font-weight: 500;
  font-size: 18px;
  padding: 6px 8px;
  text-align: center;
`

export default function NavModalUserDesktop() {
  // current user
  const currentUser = useCurrentUser()

  // modal
  const toggleNavModalUserDesktop = useNavModalUserDesktopToggle()
  const isOpen = useModalOpen(ApplicationModal.NAV_USER_DESKTOP)

  // nav links
  const navLinks = useNavUserLinks(currentUser.slug)

  if (!currentUser) return null

  return (
    <HintModal onDismiss={toggleNavModalUserDesktop} isOpen={isOpen}>
      <StyledNavModalUserDesktop>
        <BorderTooltipCaret direction="top" />
        <FillTooltipCaret direction="top" />

        <Column gap={6}>
          <Link href={`/user/${currentUser.slug}`}>
            <UsernameMenuButton>
              <Trans>{currentUser.username}</Trans>
            </UsernameMenuButton>
          </Link>

          {navLinks.map((navLinks, index) => (
            <Column key={`nav-links-${index}`} gap={6}>
              <Divider />

              <Column>
                {navLinks.map((navLink) => (
                  <Actionable key={navLink.name} link={navLink.link} handler={navLink.handler}>
                    <Trans id={navLink.name} render={({ translation }) => <MenuButton>{translation}</MenuButton>} />
                  </Actionable>
                ))}
              </Column>
            </Column>
          ))}
        </Column>
      </StyledNavModalUserDesktop>
    </HintModal>
  )
}
