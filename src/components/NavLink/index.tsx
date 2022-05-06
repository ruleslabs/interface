import React from 'react'
import styled, { css } from 'styled-components'

import ActiveLink from '@/components/ActiveLink'
import { TYPE } from '@/styles/theme'

const NavStyle = css`
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

  ${({ theme }) => theme.media.medium`
    &.active,
    &:hover {
      background: ${theme.bg5};
    }
  `}
`

const StyledLink = styled.a`
  ${NavStyle}
`

const StyledButton = styled(TYPE.body)`
  ${NavStyle}
`

export interface NavLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
}

export function NavLink({ children, href, ...props }: NavLinkProps) {
  return (
    <ActiveLink href={href} activeClassName="active">
      <StyledLink {...props}>{children}</StyledLink>
    </ActiveLink>
  )
}

export interface NavButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function NavButton({ children, ...props }: NavButtonProps) {
  return <StyledButton {...props}>{children}</StyledButton>
}
