import React from 'react'
import styled from 'styled-components'
import NextLink from 'next/link'

const StyledLink = styled.a<{ text: boolean; underline: boolean }>`
  ${({ text, theme, underline }) => `
    color: ${theme.primary1};

    :hover {
      ${underline ? 'text-decoration: underline;' : ''}
    }
  `}
`

interface LinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
  underline?: boolean
}

export default function Link({ href, children, underline = false, ...props }: LinkProps) {
  return (
    <NextLink href={href}>
      <StyledLink href={href} text={typeof children === 'string'} underline={underline} {...props}>
        {children}
      </StyledLink>
    </NextLink>
  )
}
