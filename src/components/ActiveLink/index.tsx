import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

interface ActiveLinkProps {
  children: React.ReactElement
  activeClassName: string
  href: string
  perfectMatch?: boolean
}

const ActiveLink = ({ children, activeClassName, href, perfectMatch = false, ...props }: ActiveLinkProps) => {
  const { asPath } = useRouter()
  const childClassName = children.props.className ?? ''

  const className =
    (perfectMatch && asPath === href) || (!perfectMatch && asPath.indexOf(href) === 0)
      ? `${childClassName} ${activeClassName}`.trim()
      : childClassName

  return (
    <Link href={href} {...props}>
      {React.cloneElement(children, {
        className: className || null,
      })}
    </Link>
  )
}

export default ActiveLink
