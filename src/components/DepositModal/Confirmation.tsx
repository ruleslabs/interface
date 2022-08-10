import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import Column, { ColumnCenter } from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { useCurrentUser } from '@/state/user/hooks'
import { PrimaryButton } from '@/components/Button'
import Link from '@/components/Link'
import { Error } from './Deposit'
import Spinner from '@/components/Spinner'
import { desiredChainId } from '@/constants/connectors'
import { CHAINS } from '@/constants/networks'

import Checkmark from '@/images/checkmark.svg'
import Close from '@/images/close.svg'

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

  & * {
    stroke: ${({ theme }) => theme.primary1} !important;
  }
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
  amountDeposited: number
  txHash?: string
  error?: Error
}

export default function Confirmation({ amountDeposited, txHash, error }: ConfirmationProps) {
  const currentUser = useCurrentUser()

  return (
    <ColumnCenter gap={32}>
      <Column gap={24}>
        {error ? <StyledFail /> : txHash ? <StyledCheckmark /> : <StyledSpinner />}

        {txHash ? (
          <Column gap={8}>
            <Title>
              <Trans>Your {amountDeposited} ETH deposit is on its way</Trans>
            </Title>

            <Subtitle>
              <Trans>The deposit might take a few hours to arrive on your Rules wallet.</Trans>
            </Subtitle>
          </Column>
        ) : error ? (
          <Column gap={8}>
            <Title>
              <Trans>Your deposit has been rejected</Trans>
            </Title>

            <ErrorMessage>
              <Trans>{error.message}</Trans>
            </ErrorMessage>
          </Column>
        ) : (
          <Column gap={8}>
            <Title>
              <Trans>Waiting for confirmation</Trans>
            </Title>

            <Subtitle>
              <Trans>{amountDeposited} ETH deposit on your Rules wallet</Trans>
            </Subtitle>
          </Column>
        )}
      </Column>

      {txHash && (
        <EtherscanButtonWrapper>
          <Link target="_blank" href={`${CHAINS[desiredChainId].explorerBaseUrl}/tx/${txHash}`}>
            <PrimaryButton large>
              <Trans>See on Etherscan</Trans>
            </PrimaryButton>
          </Link>
        </EtherscanButtonWrapper>
      )}
    </ColumnCenter>
  )
}
