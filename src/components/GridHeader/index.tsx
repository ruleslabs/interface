import React from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import Row, { RowBetween } from '@/components/Row'
import { TYPE } from '@/styles/theme'
import Hover from '@/components/AnimatedIcon/hover'

const Sort = styled(Row)`
  margin-bottom: 24px;
  cursor: pointer;
`

interface GridHeaderProps {
  sortTexts: string[]
  sortValue: boolean
  onSortUpdate: () => void
  children?: React.ReactNode
}

export default function GridHeader({ sortTexts, sortValue, onSortUpdate, children }: GridHeaderProps) {
  return (
    <RowBetween>
      {children}
      <Sort gap={8} onClick={onSortUpdate}>
        <Trans
          id={sortTexts[sortValue ? 0 : 1]}
          render={({ translation }) => (
            <TYPE.body fontWeight={700} style={{ lineHeight: 1.6 }}>
              {translation}
            </TYPE.body>
          )}
        />
        <Hover width="24" height="24" reverse={!sortValue} />
      </Sort>
    </RowBetween>
  )
}
