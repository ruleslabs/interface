import styled from 'styled-components'

import { TYPE } from '@/styles/theme'
import Caret from '@/components/Caret'

const StyledTooltip = styled(TYPE.body)`
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

const StyledCaret = styled(Caret)`
  position: absolute;
  bottom: 22px;
  width: 18px;
  left: 0;
  z-index: 1;

  & * {
    fill: ${({ theme }) => theme.bg3} !important;
  }
`

interface TooltipProps {
  text: string
}

export default function Tooltip({ text }: TooltipProps) {
  return (
    <StyledTooltip>
      <StyledCaret filled direction="bottom" />
      <Info>{text}</Info>i
    </StyledTooltip>
  )
}
