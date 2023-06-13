import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'

import { TYPE } from 'src/styles/theme'

import { ReactComponent as Close } from 'src/images/close.svg'
import { Column } from 'src/theme/components/Flex'

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
  margin: auto;
  color: ${({ theme }) => theme.error};
`

interface ErrorProps {
  error?: string
}

export default function Error({ error }: ErrorProps) {
  return (
    <Column gap={'24'} width={'full'}>
      <StyledFail />

      <Column gap={'8'}>
        <Title>
          <Trans>Your transaction has been rejected</Trans>
        </Title>

        <ErrorMessage>{error}</ErrorMessage>
      </Column>
    </Column>
  )
}
