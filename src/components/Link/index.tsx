import React from 'react'
import styled from 'styled-components'
import NextLink from 'next/link'

const StyledLink = styled.a<{ color?: string; underline: boolean }>`
  ${({ color = 'primary1', theme, underline }) => `
    color: ${(theme as any)[color]};

    :hover {
      ${underline ? 'text-decoration: underline;' : ''}
    }
  `}
`

interface LinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string
  color?: string
  children: React.ReactNode
  underline?: boolean
}

export default function Link({ href, color, children, underline = false, ...props }: LinkProps) {
  return (
    <NextLink href={href}>
      <StyledLink href={href} color={color} underline={underline} {...props}>
        {children}
      </StyledLink>
    </NextLink>
  )
}
