import { Trans } from '@lingui/macro'
import AccountStatus from 'src/components/AccountStatus'
import { NavButton } from 'src/components/Button'
import Link, { ActiveLink } from 'src/components/Link'
import NavModalMobile from 'src/components/NavModal/Mobile'
import { RowCenter } from 'src/components/Row'
import useCurrentUser from 'src/hooks/useCurrentUser'
import { useNavLinks } from 'src/hooks/useNav'
import { ReactComponent as ExternalLinkIcon } from 'src/images/external-link.svg'
import { ReactComponent as Hamburger } from 'src/images/hamburger.svg'
import { ReactComponent as Logo } from 'src/images/logo.svg'
import { ReactComponent as SmallLogo } from 'src/images/logo-plain.svg'
import { ApplicationSidebarModal } from 'src/state/application/actions'
import { useOpenSidebarModal } from 'src/state/application/hooks'
import styled from 'styled-components/macro'

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
  const { currentUser } = useCurrentUser()

  // modal
  const openNavModalMobile = useOpenSidebarModal(ApplicationSidebarModal.NAV_MOBILE)

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
            <ActiveLink key={navLink.name} href={navLink.link ?? ''} target={navLink.external ? '_blank' : undefined}>
              <NavButton>
                <RowCenter gap={4}>
                  <Trans id={navLink.name}>{navLink.name}</Trans>

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
