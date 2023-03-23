import React, { useMemo } from 'react'
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

export interface LinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string
  target?: string
  color?: string
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

export interface ActiveLinkProps extends LinkProps {
  perfectMatch?: boolean
  children: React.ReactElement
}

export function ActiveLink({ children, href, perfectMatch = false, ...props }: ActiveLinkProps) {
  const router = useRouter()
  const childClassName = children.props.className ?? ''

  const className = useMemo(
    () =>
      (perfectMatch && router.asPath === href) || (!perfectMatch && router.asPath.indexOf(href) === 0)
        ? `${childClassName} active`.trim()
        : childClassName,
    [perfectMatch, childClassName, href, router.asPath]
  )

  if (!children) return null

  return (
    <Link href={href} {...props}>
      {React.cloneElement(children, { className: className || null })}
    </Link>
  )
}
