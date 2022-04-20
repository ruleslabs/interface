import React from 'react'
import styled from 'styled-components'
import NextLink from 'next/link'

const StyledLink = styled.a`
  display: flex;
`

interface LinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
}

export default function Link({ href, children, ...props }: LinkProps) {
  return (
    <NextLink href={href}>
      <StyledLink href={href} {...props}>
        {children}
      </StyledLink>
    </NextLink>
  )
}
