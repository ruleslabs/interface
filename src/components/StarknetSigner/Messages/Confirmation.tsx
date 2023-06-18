import styled from 'styled-components/macro'

import Column, { ColumnCenter } from 'src/components/Column'
import { TYPE } from 'src/styles/theme'

import { ReactComponent as Checkmark } from 'src/images/checkmark.svg'
import useTrans from 'src/hooks/useTrans'

const StyledCheckmark = styled(Checkmark)`
  border-radius: 50%;
  overflow: visible;
  background: ${({ theme }) => theme.primary1};
  width: 108px;
  height: 108px;
  padding: 24px;
  margin: 0 auto;
  stroke: ${({ theme }) => theme.text1};
`

const Title = styled(TYPE.large)`
  text-align: center;
  width: 100%;
`

interface ConfirmationProps {
  action: string
}

export default function Confirmation({ action }: ConfirmationProps) {
  const trans = useTrans()

  return (
    <ColumnCenter gap={32}>
      <Column gap={24}>
        <StyledCheckmark />

        <ColumnCenter gap={8}>
          <Title>{trans('stxActionSuccess', action)}</Title>
        </ColumnCenter>
      </Column>
    </ColumnCenter>
  )
}
