import React from 'react'
import { ActiveLink, ActiveLinkProps } from 'src/components/Link'
import { NavLink } from 'src/hooks/useNav'

type ActionablePropsBase = Omit<ActiveLinkProps, 'href'> & React.HTMLAttributes<HTMLDivElement>

interface ActionableProps extends ActionablePropsBase {
  link?: NavLink['link']
  handler?: NavLink['handler']
  children: React.ReactElement
}

export default function Actionable({ link, handler, children, perfectMatch, ...props }: ActionableProps) {
  if (link) {
    return (
      <ActiveLink href={link} perfectMatch={perfectMatch} {...props}>
        {children}
      </ActiveLink>
    )
  } else if (handler) {
    return (
      <div onClick={handler} {...props}>
        {children}
      </div>
    )
  }

  return null
}
