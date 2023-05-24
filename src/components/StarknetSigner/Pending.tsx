import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import Column, { ColumnCenter } from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { EtherscanButton } from '@/components/Button'

import Spinner from '../Spinner'

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
