import React, { useMemo } from 'react'
import clsx from 'clsx'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import styled from 'styled-components/macro'

const StyledLink = styled(RouterLink)<{ color?: string; underline: boolean }>`
  outline: none;

  ${({ color = 'primary1', theme, underline }) => `
    color: ${(theme as any)[color]};

    &:hover {
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

export default function Link({ href, children, underline = false, ...props }: LinkProps) {
  return (
    <StyledLink to={href} underline={underline} {...props}>
      {children}
    </StyledLink>
  )
}

// Active Link

export interface ActiveLinkProps extends LinkProps {
  perfectMatch?: boolean
  children: React.ReactElement
}

export function ActiveLink({ children, href, perfectMatch = false, ...props }: ActiveLinkProps) {
  const { pathname } = useLocation()
  const childClassName = children.props.className ?? ''

  const className = useMemo(() => {
    const formatUrl = (url: string) => url.replace(/\/$/, '').toLowerCase()

    const formatedPathname = formatUrl(pathname)
    const formatedHref = formatUrl(href)

    return (perfectMatch && formatedPathname === formatedHref) ||
      (!perfectMatch && formatedPathname.indexOf(formatedHref) === 0)
      ? clsx(childClassName, 'active')
      : childClassName
  }, [perfectMatch, childClassName, href, pathname])

  if (!children) return null

  return (
    <Link href={href} {...props}>
      {React.cloneElement(children, { className: className || null })}
    </Link>
  )
}
