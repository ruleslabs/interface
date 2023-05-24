import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import Column, { ColumnCenter } from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { EtherscanButton } from '@/components/Button'

import Checkmark from '@/images/checkmark.svg'

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
  confirmationText: string
  txHash: string
}

export default function Confirmation({ confirmationText, txHash }: ConfirmationProps) {
  return (
    <ColumnCenter gap={32}>
      <Column gap={24}>
        <StyledCheckmark />

        <ColumnCenter gap={8}>
          <Title>{confirmationText}</Title>

          <Subtitle>
            <Trans>The transaction might take a few minutes to succeed.</Trans>
          </Subtitle>
        </ColumnCenter>
      </Column>

      <EtherscanButton txHash={txHash} />
    </ColumnCenter>
  )
}
