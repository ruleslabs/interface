import React from 'react'
import styled from 'styled-components'

import { TYPE } from '@/styles/theme'
import Caret from '@/components/Caret'
import { RowCenter } from '@/components/Row'
import { CssDirection } from '@/styles/theme'

const StyledTooltip = styled.div`
  background: ${({ theme }) => theme.bg5};
  position: absolute;
  display: none;
  border-radius: 5px;
  padding: 12px;
  z-index: 999;
  box-shadow: 0 0 4px #00000020;
`

const CaretWrapper = styled(RowCenter)<{ direction: CssDirection }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  svg {
    position: absolute;
    width: 18px;
    z-index: 1;
    fill: ${({ theme }) => theme.bg5};
  }

  ${({ direction }) => {
    switch (direction) {
      case 'top':
        return `
          top: -12px;
          bottom: unset;
        `

      case 'right':
        return `
          right: -12px;
          left: unset;
        `

      case 'bottom':
        return `
          top: unset;
          bottom: -12px;
        `

      case 'left':
        return `
          right: unset;
          left: -12px;
        `
    }

    return null
  }}
`

interface TooltipCaretProps extends React.HTMLAttributes<HTMLDivElement> {
  direction: CssDirection
}

export function TooltipCaret({ direction, ...props }: TooltipCaretProps) {
  return (
    <CaretWrapper direction={direction} {...props}>
      <Caret filled direction={direction} />
    </CaretWrapper>
  )
}

interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: CssDirection
}

export default function Tooltip({ children, direction = 'bottom', ...props }: TooltipProps) {
  return (
    <StyledTooltip {...props}>
      {children}
      <TooltipCaret direction={direction} />
    </StyledTooltip>
  )
}

const StyledInfoTooltip = styled(TYPE.body)`
  position: relative;
  background: ${({ theme }) => theme.bg3};
  width: 18px;
  height: 18px;
  line-height: 18px;
  border-radius: 50%;
  text-align: center;
  font-weight: 700;
  font-size: 12px;

  & > * {
    display: none;
  }

  &:hover > * {
    display: initial;
  }
`

const Info = styled(TYPE.body)`
  background: ${({ theme }) => theme.bg3};
  border-radius: 5px;
  padding: 12px;
  position: absolute;
  bottom: 32px;
  width: 212px;
  text-align: left;
  left: -97px;
  box-shadow: 0px 4px 4px #00000040;
`

const StyledInfoCaret = styled(Caret)`
  position: absolute;
  bottom: 22px;
  width: 18px;
  left: 0;
  z-index: 1;

  & * {
    fill: ${({ theme }) => theme.bg3} !important;
  }
`

interface InfoTooltipProps {
  text: string
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  return (
    <StyledInfoTooltip>
      <StyledInfoCaret filled direction="bottom" />
      <Info>{text}</Info>i
    </StyledInfoTooltip>
  )
}
