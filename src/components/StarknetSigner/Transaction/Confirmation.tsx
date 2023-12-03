import { Trans } from '@lingui/macro'
import { EtherscanButton } from 'src/components/Button'
import Column, { ColumnCenter } from 'src/components/Column'
import useTrans from 'src/hooks/useTrans'
import { ReactComponent as Checkmark } from 'src/images/checkmark.svg'
import { TYPE } from 'src/styles/theme'
import styled from 'styled-components/macro'

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

const Subtitle = styled(TYPE.body)`
  text-align: center;
  width: 100%;
  max-width: 420px;
`

interface ConfirmationProps {
  action: string
  txHash: string
}

export default function Confirmation({ action, txHash }: ConfirmationProps) {
  const trans = useTrans()

  return (
    <ColumnCenter gap={32}>
      <Column gap={24}>
        <StyledCheckmark />

        <ColumnCenter gap={8}>
          <Title>{trans('stxActionSuccess', action)}</Title>

          <Subtitle>
            <Trans>The transaction might take a few minutes to succeed.</Trans>
          </Subtitle>
        </ColumnCenter>
      </Column>

      <EtherscanButton txHash={txHash} />
    </ColumnCenter>
  )
}
