import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { ColumnCenter } from '@/components/Column'
import { TYPE } from '@/styles/theme'

import Close from '@/images/close.svg'

const StyledFail = styled(Close)`
  border-radius: 50%;
  overflow: visible;
  background: ${({ theme }) => theme.error};
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

const ErrorMessage = styled(Subtitle)`
  text-align: center;
  width: 100%;
  max-width: 420px;
  color: ${({ theme }) => theme.error};
`

interface ErrorProps {
  error?: string
}

export default function Error({ error }: ErrorProps) {
  return (
    <ColumnCenter gap={24}>
      <StyledFail />

      <ColumnCenter gap={8}>
        <Title>
          <Trans>Your transaction has been rejected</Trans>
        </Title>

        <ErrorMessage>{error}</ErrorMessage>
      </ColumnCenter>
    </ColumnCenter>
  )
}
