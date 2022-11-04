import React from 'react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import styled from 'styled-components'

const StyledLink = styled.a<{ color?: string; underline: boolean }>`
  outline: none;

  ${({ color = 'primary1', theme, underline }) => `
    color: ${(theme as any)[color]};

    :hover {
      ${underline ? 'text-decoration: underline;' : ''}
    }
  `}
`

interface LinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string
  target?: string
  color?: string
  children: React.ReactNode
  underline?: boolean
}

export default function Link({ href, color, target, children, underline = false, ...props }: LinkProps) {
  return (
    <NextLink href={href}>
      <StyledLink href={href} target={target} color={color} underline={underline} {...props}>
        {children}
      </StyledLink>
    </NextLink>
  )
}

// Active Link

interface ActiveLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  children: React.ReactElement
  href: string
  target?: string
  perfectMatch?: boolean
}

export function ActiveLink({ children, href, perfectMatch = false, ...props }: ActiveLinkProps) {
  const { asPath } = useRouter()
  const childClassName = children.props.className ?? ''

  const className =
    (perfectMatch && asPath === href) || (!perfectMatch && asPath.indexOf(href) === 0)
      ? `${childClassName} active`.trim()
      : childClassName

  return (
    <Link href={href} {...props}>
      {React.cloneElement(children, { className: className || null })}
    </Link>
  )
}
