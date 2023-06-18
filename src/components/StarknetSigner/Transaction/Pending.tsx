import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'

import Column, { ColumnCenter } from 'src/components/Column'
import { TYPE } from 'src/styles/theme'
import { EtherscanButton } from 'src/components/Button'
import Spinner from 'src/components/Spinner'

const StyledSpinner = styled(Spinner)`
  margin: 0 auto;
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

interface PendingProps {
  txHash: string
}

export default function Pending({ txHash }: PendingProps) {
  return (
    <ColumnCenter gap={32}>
      <Column gap={24}>
        <StyledSpinner />

        <ColumnCenter gap={8}>
          <Title>
            <Trans>Your wallet is already processing another transaction</Trans>
          </Title>

          <Subtitle>
            <Trans>The transaction might take a few minutes to succeed.</Trans>
          </Subtitle>
        </ColumnCenter>
      </Column>

      <EtherscanButton txHash={txHash} />
    </ColumnCenter>
  )
}
