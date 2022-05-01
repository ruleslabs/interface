import React from 'react'
import styled from 'styled-components'
import NextLink from 'next/link'

const StyledLink = styled.a<{ text: boolean }>`
  ${({ text, theme }) => `
    color: ${theme.primary1};

    :hover {
      text-decoration: underline;
    }
  `}
`

interface LinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
}

export default function Link({ href, children, ...props }: LinkProps) {
  return (
    <NextLink href={href}>
      <StyledLink href={href} text={typeof children === 'string'} {...props}>
        {children}
      </StyledLink>
    </NextLink>
  )
}
