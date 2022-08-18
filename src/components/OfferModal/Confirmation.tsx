import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import Column, { ColumnCenter } from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { PrimaryButton } from '@/components/Button'
import Link from '@/components/Link'
import Spinner from '@/components/Spinner'
import { NETWORKS, networkId } from '@/constants/networks'

import Checkmark from '@/images/checkmark.svg'
import Close from '@/images/close.svg'

const StyledConfirmation = styled(ColumnCenter)`
  padding-bottom: 8px;
  gap: 32px;
`

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

const ErrorMessage = styled(Subtitle)`
  text-align: center;
  width: 100%;
  max-width: 420px;
  color: ${({ theme }) => theme.error};
`

const EtherscanButtonWrapper = styled(ColumnCenter)`
  width: 100%;
  gap: 16px;

  a {
    max-width: 380px;
    width: 100%;
  }

  button {
    height: 50px;
    width: 100%;
  }
`

interface ConfirmationProps {
  txHash?: string
  error?: string
  waitingForFees: boolean
}

export default function Confirmation({ txHash, error, waitingForFees }: ConfirmationProps) {
  return (
    <StyledConfirmation>
      <Column gap={24}>
        {error ? <StyledFail /> : txHash ? <StyledCheckmark /> : <StyledSpinner fill="primary1" />}

        {txHash ? (
          <ColumnCenter gap={8}>
            <Title>
              <Trans>Your card-name is on its way</Trans>
            </Title>

            <Subtitle>
              <Trans>The transfer might take a few hours to succeed.</Trans>
            </Subtitle>
          </ColumnCenter>
        ) : error ? (
          <ColumnCenter gap={8}>
            <Title>
              <Trans>Your transaction has been rejected</Trans>
            </Title>

            <ErrorMessage>
              <Trans>{error}</Trans>
            </ErrorMessage>
          </ColumnCenter>
        ) : (
          <ColumnCenter gap={8}>
            <Title>
              {waitingForFees ? <Trans>Estimating network fee</Trans> : <Trans>Waiting for confirmation</Trans>}
            </Title>

            <Subtitle>
              <Trans>Card transfer.</Trans>
            </Subtitle>
          </ColumnCenter>
        )}
      </Column>

      {txHash && (
        <EtherscanButtonWrapper>
          <Link target="_blank" href={`${NETWORKS[networkId].explorerBaseUrl}/tx/${txHash}`}>
            <PrimaryButton large>
              <Trans>See on Voyager</Trans>
            </PrimaryButton>
          </Link>
        </EtherscanButtonWrapper>
      )}
    </StyledConfirmation>
  )
}
