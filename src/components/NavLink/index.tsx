import React from 'react'
import styled from 'styled-components'

import ActiveLink from '@/components/ActiveLink'

const StyledLink = styled.a`
  display: flex;
  padding: 0 20px;
  height: 100%;
  align-items: center;
  transition: 100ms ease background;
  cursor: pointer;

  &.active,
  &:hover {
    background: ${({ theme }) => theme.bg3};
  }

  &.active {
    font-weight: 700;
  }
`

interface NavLinkProps {
  children: React.ReactNode
  href: string
}

export default function NavLink({ children, href }: NavLinkProps) {
  return (
    <ActiveLink href={href} activeClassName="active">
      <StyledLink>{children}</StyledLink>
    </ActiveLink>
  )
}
