import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import AccountStatus from '@/components/AccountStatus'
import { NavLink } from '@/components/NavLink'
import Link from '@/components/Link'
import { useOpenModal, useCloseModal, useModalOpen } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import NavModal from '@/components/NavModal'
import { useCurrentUser } from '@/state/user/hooks'
import { ColumnCenter } from '@/components/Column'
import { TYPE } from '@/styles/theme'

import Logo from '@/public/assets/logo.svg'
import Hamburger from '@/images/hamburger.svg'
import Close from '@/images/close.svg'

const MobileNavWrapper = styled.div`
  display: none;

  ${({ theme }) => theme.media.medium`
    display: inherit;
  `}
`

const StyledHeader = styled.header`
  height: ${({ theme }) => theme.size.headerHeight};
  background-color: ${({ theme }) => theme.bg2};
  display: flex;
  align-items: center;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.15);
  position: sticky;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  z-index: 3;
  padding: 64px 100px 0;

  ${({ theme }) => theme.media.medium`
    padding: 64px 1rem 0;
    justify-content: space-between;
    height: ${theme.size.headerHeightMedium};
    z-index: 999;
  `}
`

const StyledLogo = styled(Logo)`
  height: 24px;
  fill: ${({ theme }) => theme.white};
  margin-right: 8px;
`

const StyledClose = styled(Close)`
  width: 20px;
  height: 20px;
  cursor: pointer;
`

const NavBar = styled.nav`
  margin-left: 64px;
  height: 100%;
  display: flex;

  ${({ theme }) => theme.media.medium`
    display: none;
  `}
`

const StyledAccountStatus = styled(AccountStatus)`
  ${({ theme }) => theme.media.medium`
    display: none;
  `}
`

const HamburgerWrapper = styled.div<{ alert?: boolean }>`
  ${({ theme, alert = false }) => alert && theme.before.alert}
`

const ComingSoon = styled(ColumnCenter)`
  background: ${({ theme }) => theme.primary1};
  padding: 12px 0;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  position: absolute;
  z-index: 1;
  justify-content: center;

  & a {
    text-decoration: underline;
  }
`

interface MenuLink {
  name: string
  link: string
}

export const menuLinks: MenuLink[] = [
  { name: 'Packs', link: '/packs' },
  { name: 'Marketplace', link: '/marketplace' },
  { name: 'Community', link: '/community' },
] // TODO: move it somewhere else as a single source of truth

export default function Header() {
  const openNavModal = useOpenModal(ApplicationModal.NAV)
  const closeModal = useCloseModal()
  const allModalsClosed = useModalOpen(null)
  const currentUser = useCurrentUser()

  return (
    <StyledHeader>
      <ComingSoon>
        <TYPE.medium textAlign="center">Rules participe au ZEvent Place</TYPE.medium>
        <TYPE.body textAlign="center">
          <Trans>
            Place ton pixel pour représenter la commu en suivant&nbsp;
            <Link color="text1" href="/place" target="_blank" underline>
              ce dessin
            </Link>
            .
          </Trans>
        </TYPE.body>
      </ComingSoon>

      <Link href="/">
        <StyledLogo />
      </Link>

      <NavBar>
        {menuLinks.map((menuLink: MenuLink, index: number) => (
          <Trans
            key={`nav-link-${index}`}
            id={menuLink.name}
            render={({ translation }) => <NavLink href={menuLink.link}>{translation}</NavLink>}
          />
        ))}
      </NavBar>

      <div style={{ margin: 'auto' }} />

      <StyledAccountStatus />

      <MobileNavWrapper>
        {allModalsClosed ? (
          <HamburgerWrapper alert={currentUser?.starknetWallet.needsSignerPublicKeyUpdate}>
            <Hamburger onClick={openNavModal} />
          </HamburgerWrapper>
        ) : (
          <StyledClose onClick={closeModal} />
        )}
        <NavModal />
      </MobileNavWrapper>
    </StyledHeader>
  )
}
