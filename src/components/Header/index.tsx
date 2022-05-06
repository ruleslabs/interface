import styled from 'styled-components'

import AccountStatus from '@/components/AccountStatus'
import NavLink from '@/components/NavLink'
import Logo from '@/public/assets/logo.svg'
import Link from '@/components/Link'
import Hamburger from '@/images/hamburger.svg'
import Close from '@/images/close.svg'
import { useOpenModal, useCloseModal, useModalOpen } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import NavModal from '@/components/NavModal'

const MobileNavWrapper = styled.div`
  display: none;

  ${({ theme }) => theme.media.medium`
    display: inherit;
  `}
`

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

  ${({ theme }) => theme.media.medium`
    padding: 0 1rem;
    justify-content: space-between;
    height: 62px;
    z-index: 999;
  `}
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

  ${({ theme }) => theme.media.medium`
    display: none;
  `}
`

const StyledAccountStatus = styled(AccountStatus)`
  ${({ theme }) => theme.media.medium`
    display: none;
  `}
`

export default function Header() {
  const openNavModal = useOpenModal(ApplicationModal.NAV)
  const closeModal = useCloseModal()
  const allModalsClosed = useModalOpen(null)

  return (
    <StyledHeader>
      <Link href="/">
        <StyledLogo onClick={closeModal} />
      </Link>

      <NavBar>
        <NavLink href="/packs">Packs</NavLink>
        <NavLink href="/marketplace">Marketplace</NavLink>
        <NavLink href="/community">Community</NavLink>
      </NavBar>

      <div style={{ margin: 'auto' }} />

      <StyledAccountStatus />

      <MobileNavWrapper>
        {allModalsClosed ? <Hamburger onClick={openNavModal} /> : <Close onClick={closeModal} />}
        <NavModal />
      </MobileNavWrapper>
    </StyledHeader>
  )
}
