import { useMemo } from 'react'
import styled from 'styled-components'

import { TYPE } from '@/styles/theme'

const StyledLabel = styled(TYPE.body)<{ color: string }>`
  font-size: 14px;
  padding: 2px 6px;
  border-radius: 6px;
  background: ${({ theme, color }) => (theme as any)[color]}20;
  border: 1px solid ${({ theme, color }) => (theme as any)[color]}80;
  color: ${({ theme, color }) => (theme as any)[color]};
  border-radius: 6px;
`

interface LabelProps {
  value: string
  color: string
  uppercased?: boolean
}

export default function Label({ value, color, uppercased = false }: LabelProps) {
  const finalValue = useMemo(() => (uppercased ? value.toUpperCase() : value), [value])

  return <StyledLabel color={color}>{finalValue}</StyledLabel>
}
