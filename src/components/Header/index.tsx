import styled from 'styled-components'

import AccountStatus from '@/components/AccountStatus'
import NavLink from '@/components/NavLink'
import Logo from '@/public/assets/logo.svg'
import Link from '@/components/Link'

const StyledHeader = styled.header`
  height: 57px;
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
  padding: 0 100px;
`

const StyledLogo = styled(Logo)`
  height: 24px;
  fill: ${({ theme }) => theme.white};
  margin-right: 8px;
`

const NavBar = styled.nav`
  margin-left: 64px;
  height: 100%;
  display: flex;
`

export default function Header() {
  return (
    <StyledHeader>
      <Link href="/">
        <StyledLogo />
      </Link>
      <NavBar>
        <NavLink href="/packs">Packs</NavLink>
        <NavLink href="/marketplace">Échange</NavLink>
        <NavLink href="/community">Communauté</NavLink>
      </NavBar>
      <div style={{ margin: '0 auto' }} />
      <AccountStatus />
    </StyledHeader>
  )
}
