import React from 'react'
import styled from 'styled-components'

import ActiveLink from '@/components/ActiveLink'

const StyledLink = styled.a`
  padding-bottom: 8px;
  cursor: pointer;
  border-width: 0 0 1px;
  border-style: solid;
  border-color: transparent;
  transition: 100ms ease border-color;

  &.active {
    font-weight: 700;
    border-color: ${({ theme }) => theme.white};
  }
`

interface TabLinkProps {
  children: React.ReactNode
  href: string
}

export default function TabLink({ children, href }: TabLinkProps) {
  return (
    <ActiveLink href={href} activeClassName="active" perfectMatch>
      <StyledLink>{children}</StyledLink>
    </ActiveLink>
  )
}
