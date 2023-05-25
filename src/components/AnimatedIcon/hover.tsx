import React from 'react'
import styled, { css } from 'styled-components/macro'

import { ReactComponent as Hover } from 'src/images/hover.svg'

const StyledHover = styled(Hover)<{ $reverse: boolean }>`
  ${({ $reverse }) => css`
    #top-bar,
    #bottom-bar {
      transition: width 200ms ease, x 200ms ease;
    }

    #top-bar {
      width: ${$reverse ? '6' : '20'}px;
      x: ${$reverse ? '9' : '2'}px;
    }

    #bottom-bar {
      width: ${$reverse ? '20' : '6'}px;
      x: ${$reverse ? '2' : '9'}px;
    }
  `}
`

interface StyledHoverProps extends Omit<React.SVGProps<SVGSVGElement>, 'ref'> {
  reverse?: boolean
}

export default function AnimatedHover({ reverse = false, ...props }: StyledHoverProps) {
  return <StyledHover $reverse={reverse} {...props} />
}
