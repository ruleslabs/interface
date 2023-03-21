import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import AccountStatus from '@/components/AccountStatus'
import { NavButton } from '@/components/Button'
import { RowCenter } from '@/components/Row'
import Link, { ActiveLink } from '@/components/Link'
import { useOpenModal } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import NavModalMobile from '@/components/NavModal/Mobile'
import { useCurrentUser } from '@/state/user/hooks'
import { useNavLinks } from '@/hooks/useNav'

import Logo from '@/public/assets/logo.svg'
import SmallLogo from '@/images/logo-plain.svg'
import Hamburger from '@/images/hamburger.svg'
import ExternalLinkIcon from '@/images/external-link.svg'

const StyledHeader = styled.header`
  height: ${({ theme }) => theme.size.headerHeight}px;
  background-color: ${({ theme }) => theme.bg1};
  display: flex;
  align-items: center;
  position: sticky;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  z-index: 3;
  padding: 0 32px;

  ${({ theme }) => theme.media.medium`
    padding: 0 16px;
    justify-content: space-between;
    height: ${theme.size.headerHeightMedium}px;
    z-index: 999;
  `}

  ${({ theme }) => theme.media.extraSmall`
    padding: 0 12px;
  `}
`

const StyledExternalLinkIcon = styled(ExternalLinkIcon)`
  width: 12px;
  height: 12px;
  fill: ${({ theme }) => theme.text2};
`

const HamburgerWrapper = styled.div<{ alert?: boolean; notifications?: number }>`
  cursor: pointer;

  svg {
    width: 18px;
    height: 18px;
  }
`

const NavMobileWrapper = styled.div`
  display: none;
  margin-right: 12px;

  ${({ theme }) => theme.media.medium`
    display: unset;
  `}
`

const NavBar = styled.nav`
  margin-left: 32px;
  height: 100%;
  display: flex;

  ${({ theme }) => theme.media.medium`
    display: none;
  `}
`

// LOGO

const StyledSmallLogo = styled(SmallLogo)`
  height: 32px;
  fill: ${({ theme }) => theme.white};
  margin-right: 8px;
  display: none;

  ${({ theme }) => theme.media.extraSmall`
    display: unset;
  `}
`

const StyledLogo = styled(Logo)`
  height: 24px;
  fill: ${({ theme }) => theme.white};
  margin-right: 8px;

  ${({ theme }) => theme.media.medium`
    height: 18px;
  `}
`

const NotLoggedLogo = styled(StyledLogo)`
  ${({ theme }) => theme.media.extraSmall`
    display: none;
  `}
`

export default function Header() {
  // current user
  const currentUser = useCurrentUser()

  // modal
  const openNavModalMobile = useOpenModal(ApplicationModal.NAV_MOBILE)

  // nav links
  const navLinks = useNavLinks()

  return (
    <StyledHeader>
      <NavMobileWrapper>
        <HamburgerWrapper>
          <Hamburger onClick={openNavModalMobile} />
        </HamburgerWrapper>

        <NavModalMobile />
      </NavMobileWrapper>

      <Link href="/">
        {currentUser ? (
          <StyledLogo />
        ) : (
          <>
            <NotLoggedLogo />
            <StyledSmallLogo />
          </>
        )}
      </Link>

      <NavBar>
        {navLinks.map((navLink) =>
          navLink.map((navLink) => (
            <ActiveLink key={navLink.name} href={navLink.link!} target={navLink.external ? '_blank' : undefined}>
              <NavButton>
                <RowCenter gap={4}>
                  <Trans id={navLink.name} render={({ translation }) => <>{translation}</>} />

                  {navLink.external && <StyledExternalLinkIcon />}
                </RowCenter>
              </NavButton>
            </ActiveLink>
          ))
        )}
      </NavBar>

      <div style={{ margin: 'auto' }} />

      <AccountStatus />
    </StyledHeader>
  )
}
