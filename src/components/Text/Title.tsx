import React from 'react'

import { TYPE } from '@/styles/theme'
import { RowBetween } from '@/components/Row'
import Column from '@/components/Column'
import Divider from '@/components/Divider'

interface TitleProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export default function Title({ value, children }: TitleProps) {
  return (
    <Column gap={12}>
      <RowBetween alignItems="center" gap={16}>
        <TYPE.large>{value}</TYPE.large>
        {children}
      </RowBetween>

      <Divider />
    </Column>
  )
}
