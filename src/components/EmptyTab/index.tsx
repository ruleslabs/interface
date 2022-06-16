import styled from 'styled-components'

import { TYPE } from '@/styles/theme'
import { ColumnCenter } from '@/components/Column'
import Card from '@/components/Card'

import Ghost from '@/images/ghost.svg'

const StyledEmptyTab = styled(ColumnCenter)`
  justify-content: center;
  height: 375px;
  gap: 20px;

  svg {
    width: 70px;
    fill: ${({ theme }) => theme.text2};
  }
`

interface EmptyTabProps {
  emptyText: string
}

export default function EmptyTab({ emptyText }: EmptyTabProps) {
  return (
    <Card>
      <StyledEmptyTab>
        <Ghost />
        <TYPE.body>{emptyText}</TYPE.body>
      </StyledEmptyTab>
    </Card>
  )
}
