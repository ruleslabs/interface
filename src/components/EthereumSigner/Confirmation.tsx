import { Trans } from '@lingui/macro'
import { PrimaryButton } from 'src/components/Button'
import Column, { ColumnCenter } from 'src/components/Column'
import Link from 'src/components/Link'
import Spinner from 'src/components/Spinner'
import { getChainInfo } from 'src/constants/chainInfo'
import { ReactComponent as Checkmark } from 'src/images/checkmark.svg'
import { ReactComponent as Close } from 'src/images/close.svg'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import { TYPE } from 'src/styles/theme'
import styled from 'styled-components/macro'

const StyledConfirmation = styled(ColumnCenter)`
  padding-bottom: 8px;
  gap: 32px;

  & > * {
    width: 100%;
  }
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
  confirmationText: string
  transactionDesc: string
  txHash?: string
  error?: string
}

export default function Confirmation({ confirmationText, transactionDesc, txHash, error }: ConfirmationProps) {
  return (
    <StyledConfirmation>
      <Column gap={24}>
        {txHash ? <StyledCheckmark /> : error ? <StyledFail /> : <StyledSpinner fill="primary1" />}

        {txHash ? (
          <ColumnCenter gap={8}>
            <Title>{confirmationText}</Title>

            <Subtitle>
              <Trans>The transaction might take a few hours to succeed.</Trans>
            </Subtitle>
          </ColumnCenter>
        ) : error ? (
          <ColumnCenter gap={8}>
            <Title>
              <Trans>Your transaction has been rejected</Trans>
            </Title>

            <ErrorMessage>{error}</ErrorMessage>
          </ColumnCenter>
        ) : (
          <ColumnCenter gap={8}>
            <Title>
              <Trans>Waiting for confirmation</Trans>
            </Title>

            <Subtitle>{transactionDesc}</Subtitle>
          </ColumnCenter>
        )}
      </Column>

      {txHash && (
        <EtherscanButtonWrapper>
          <Link target="_blank" href={`${getChainInfo(rulesSdk.networkInfos.ethereumChainId)?.explorer}tx/${txHash}`}>
            <PrimaryButton large>
              <Trans>See on Etherscan</Trans>
            </PrimaryButton>
          </Link>
        </EtherscanButtonWrapper>
      )}
    </StyledConfirmation>
  )
}
