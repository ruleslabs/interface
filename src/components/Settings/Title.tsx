import React from 'react'
import styled from 'styled-components'

import { TYPE } from '@/styles/theme'
import { RowBetween } from '../Row'

const StyledHr = styled.div`
  margin-top: 12px;
  width: 100%;
  height: 1px;
  background: ${({ theme }) => theme.bg3}80;
`

interface TitleProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export default function Title({ value, children }: TitleProps) {
  return (
    <div>
      <RowBetween alignItems="center" gap={16}>
        <TYPE.large>{value}</TYPE.large>
        {children}
      </RowBetween>

      <StyledHr />
    </div>
  )
}
