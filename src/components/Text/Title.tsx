import React from 'react'
import styled from 'styled-components'

import { TYPE } from '@/styles/theme'
import { RowBetween } from '@/components/Row'
import Column from '@/components/Column'
import Divider from '@/components/Divider'

const StyledTitle = styled(TYPE.large)`
  margin-left: 4px;
`

interface TitleProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export default function Title({ value, children }: TitleProps) {
  return (
    <Column gap={12}>
      <RowBetween alignItems="center" gap={16}>
        <StyledTitle>{value}</StyledTitle>
        {children}
      </RowBetween>

      <Divider />
    </Column>
  )
}
