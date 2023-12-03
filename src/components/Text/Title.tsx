import React from 'react'
import Column from 'src/components/Column'
import Divider from 'src/components/Divider'
import { RowBetween } from 'src/components/Row'
import { TYPE } from 'src/styles/theme'
import styled from 'styled-components/macro'

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
