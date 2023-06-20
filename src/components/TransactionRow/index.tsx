/* eslint-disable react/display-name */
import React, { useMemo, useState, useCallback } from 'react'
import styled from 'styled-components/macro'
import { WeiAmount, Unit, constants } from '@rulesorg/sdk-core'
import { Trans } from '@lingui/macro'

import Link from 'src/components/Link'
import Column from 'src/components/Column'
import { RowCenter } from 'src/components/Row'
import { TYPE } from 'src/styles/theme'
import Status from './Status'
import useReduceHash from 'src/hooks/useReduceHash'
import Caret from 'src/components/Caret'
import Card from 'src/components/Card'
import Event, { WalletEvent } from './Event'
import Message from './Message'
import OffchainAction from './OffchainAction'
import useAge from 'src/hooks/useAge'

import { ReactComponent as ExternalLinkIcon } from 'src/images/external-link.svg'
import { getChainInfo } from 'src/constants/chainInfo'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'

const StyledTransactionRow = styled(Card)<{ offchain: boolean }>`
  ${({ offchain }) => offchain && 'opacity: 0.7;'}
`

const SeeDetails = styled(TYPE.body)`
  margin-top: 16px;

  svg {
    height: 12px;
  }

  svg * {
    fill: ${({ theme }) => theme.bg3} !important;
  }
`

const TxGrid = styled.div<{ isOpen?: boolean }>`
  ${({ isOpen = true }) => isOpen && 'margin-top: 16px;'}
  max-height: ${({ isOpen = true }) => (isOpen ? '75px' : 0)};
  overflow-x: scroll;
  overflow-y: hidden;
  transition: max-height 250ms, margin 250ms;

  transform-origin: top;
  display: grid;
  grid-template-columns: repeat(6, 1fr);

  & > * {
    padding: 8px;
    white-space: nowrap;
  }
`

const HeaderRow = styled.div`
  background: ${({ theme }) => theme.bg3}40;
  gap: 16px;
`

const StarkscanLink = styled(TYPE.body)`
  font-family: Inconsolata, monospace;
  color: ${({ theme }) => theme.primary1};

  &:hover {
    text-decoration: underline;
  }
`

const StyledExternalLinkIcon = styled(ExternalLinkIcon)`
  width: 12px;
  height: 12px;
  fill: ${({ theme }) => theme.text1};
`

// Main Components

interface TransactionRowProps extends React.HTMLAttributes<HTMLDivElement> {
  hash: string
  address?: string
  publicKey: string
  fromAddress?: string
  status: string
  code?: string
  blockNumber?: number
  blockTimestamp?: Date
  actualFee?: string
  offchainData?: {
    action: string
  }
  events: Array<{
    key: string
    data: string[]
  }>
  l2ToL1Messages: Array<{
    fromAddress: string
    toAddress: string
    payload: string[]
  }>
}

const TransactionRow = React.forwardRef<HTMLDivElement, TransactionRowProps>(
  (
    {
      hash,
      address,
      publicKey,
      fromAddress,
      status,
      code,
      blockNumber,
      blockTimestamp,
      actualFee,
      events,
      l2ToL1Messages,
      offchainData,
      ...props
    },
    ref
  ) => {
    // blockchain details visibility
    const [areBlockchainDetailsOpen, setAreBlockchainDetailsOpen] = useState(false)
    const toggleBlockchainDetails = useCallback(
      () => setAreBlockchainDetailsOpen(!areBlockchainDetailsOpen),
      [areBlockchainDetailsOpen]
    )

    // tx age
    const transactionAge = useAge(blockTimestamp)

    // reduce hash
    const reducedHash = useReduceHash(hash)

    // parsed fee
    const parsedFee = useMemo(() => (actualFee ? WeiAmount.fromRawAmount(actualFee) : undefined), [actualFee])

    if (!address) return null

    return (
      <StyledTransactionRow offchain={status === 'RECEIVED' || status === 'REJECTED'} {...props}>
        <Column gap={8} ref={ref}>
          {events.map((event, index) => (
            <Event key={index} address={address} publicKey={publicKey} $key={event.key} $data={event.data} />
          ))}

          {l2ToL1Messages.map((message, index) => (
            <Message
              key={index}
              address={address}
              fromAddress={message.fromAddress}
              toAddress={message.toAddress}
              payload={message.payload}
            />
          ))}

          {!fromAddress && <WalletEvent eventKey={constants.OldEventKeys.ACCOUNT_INITIALIZED} />}

          {!events.length && !l2ToL1Messages.length && offchainData?.action && (
            <OffchainAction action={offchainData.action} status={status} />
          )}
        </Column>

        <SeeDetails clickable>
          <RowCenter gap={6} onClick={toggleBlockchainDetails}>
            <Caret direction={areBlockchainDetailsOpen ? 'bottom' : 'right'} filled />

            <Trans>See transaction</Trans>
          </RowCenter>
        </SeeDetails>

        <TxGrid isOpen={areBlockchainDetailsOpen}>
          <HeaderRow>
            <TYPE.body>
              <Trans>Transaction hash</Trans>
            </TYPE.body>
          </HeaderRow>
          <HeaderRow>
            <TYPE.body>
              <Trans>Block number</Trans>
            </TYPE.body>
          </HeaderRow>
          <HeaderRow>
            <TYPE.body>
              <Trans>Status</Trans>
            </TYPE.body>
          </HeaderRow>
          <HeaderRow>
            <TYPE.body>
              <Trans>Origin</Trans>
            </TYPE.body>
          </HeaderRow>
          <HeaderRow>
            <TYPE.body>
              <Trans>Fee</Trans>
            </TYPE.body>
          </HeaderRow>
          <HeaderRow>
            <TYPE.body>
              <Trans>Age</Trans>
            </TYPE.body>
          </HeaderRow>

          <div>
            <Link target="_blank" href={`${getChainInfo(rulesSdk.networkInfos.starknetChainId).explorer}/tx/${hash}`}>
              <RowCenter gap={6}>
                <StarkscanLink>{reducedHash}</StarkscanLink>
                <StyledExternalLinkIcon />
              </RowCenter>
            </Link>
          </div>

          <div>
            {blockNumber ? (
              <Link
                target="_blank"
                href={`${getChainInfo(rulesSdk.networkInfos.starknetChainId).explorer}/block/${blockNumber}`}
              >
                <RowCenter gap={6}>
                  <StarkscanLink>{blockNumber}</StarkscanLink>
                  <StyledExternalLinkIcon />
                </RowCenter>
              </Link>
            ) : (
              <TYPE.small>N/A</TYPE.small>
            )}
          </div>

          <div>
            <Status type="status" value={code ?? status} />
          </div>

          <div>
            <Status type="origin" value={address === fromAddress} />
          </div>

          <div>
            <TYPE.small>{parsedFee ? `${parsedFee.toUnitFixed(Unit.GWEI, 0)} Gwei` : 'N/A'}</TYPE.small>
          </div>

          <div>
            <TYPE.small>{transactionAge ?? 'N/A'}</TYPE.small>
          </div>
        </TxGrid>
      </StyledTransactionRow>
    )
  }
)

export default TransactionRow
