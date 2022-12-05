import 'moment/locale/fr'

import React, { useMemo, useState, useCallback } from 'react'
import moment from 'moment'
import styled from 'styled-components'
import { WeiAmount } from '@rulesorg/sdk-core'
import { Trans } from '@lingui/macro'

import Link from '@/components/Link'
import Column from '@/components/Column'
import { useActiveLocale } from '@/hooks/useActiveLocale'
import { RowCenter } from '@/components/Row'
import { TYPE } from '@/styles/theme'
import { NETWORKS, networkId } from '@/constants/networks'
import Badge from './Badge'
import useReduceHash from '@/hooks/useReduceHash'
import Caret from '@/components/Caret'
import Card from '@/components/Card'
import Event from './Event'
import Message from './Message'
import OffchainAction from './OffchainAction'

import ExternalLinkIcon from '@/images/external-link.svg'

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
  overflow: hidden;
  transition: max-height 250ms, margin 250ms;

  transform-origin: top;
  display: grid;
  grid-template-columns: repeat(6, 1fr);

  & > * {
    padding: 8px;
  }
`

const HeaderRow = styled.div`
  background: ${({ theme }) => theme.bg5};
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
  address: string
  fromAddress: string
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

const MemoizedTransactionRowPropsEqualityCheck = (prevProps: TransactionRowProps, nextProps: TransactionRowProps) =>
  prevProps.hash === nextProps.hash

const MemoizedTransactionRow = React.memo(function TransactionRow({
  hash,
  address,
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
}: TransactionRowProps) {
  // blockchain details visibility
  const [areBlockchainDetailsOpen, setAreBlockchainDetailsOpen] = useState(false)
  const toggleBlockchainDetails = useCallback(
    () => setAreBlockchainDetailsOpen(!areBlockchainDetailsOpen),
    [areBlockchainDetailsOpen]
  )

  // get locale
  const locale = useActiveLocale()

  // tx age
  const transactionAge = useMemo(() => {
    if (!blockTimestamp) return

    moment.locale('en', {
      relativeTime: {
        future: 'in %s',
        past: '%s',
        s: '1s',
        ss: '%ss',
        m: '1min',
        mm: '%dmin',
        h: '1h',
        hh: '%dh',
        d: '1d',
        dd: '%dd',
      },
    })

    moment.locale('fr', {
      relativeTime: {
        future: 'in %s',
        past: '%s ago',
        s: '1s',
        ss: '%ss',
        m: '1min',
        mm: '%dmin',
        h: '1h',
        hh: '%dh',
        d: '1j',
        dd: '%dj',
      },
    })

    moment.relativeTimeThreshold('s', 60)
    moment.relativeTimeThreshold('m', 60)
    moment.relativeTimeThreshold('h', 24)
    moment.relativeTimeThreshold('d', 100_000_000) // any number big enough

    return moment(blockTimestamp).locale(locale).fromNow(true)
  }, [blockTimestamp, locale])

  // reduce hash
  const reducedHash = useReduceHash(hash)

  // parsed fee
  const parsedFee = useMemo(() => (actualFee ? WeiAmount.fromRawAmount(actualFee, 'gwei') : undefined), [actualFee])

  return (
    <StyledTransactionRow offchain={status === 'RECEIVED' || status === 'REJECTED'} {...props}>
      <Column gap={8}>
        {events.map((event, index) => (
          <Event key={index} address={address} $key={event.key} $data={event.data} />
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

        {!events.length && !l2ToL1Messages.length && offchainData?.action && (
          <OffchainAction action={offchainData.action} status={status} />
        )}
      </Column>

      <SeeDetails clickable>
        <RowCenter gap={6} onClick={toggleBlockchainDetails}>
          <Caret direction={areBlockchainDetailsOpen ? 'bottom' : 'right'} filled />

          <Trans>See blockchain details</Trans>
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
          <Link target="_blank" href={`${NETWORKS[networkId].explorerBaseUrl}/tx/${hash}`}>
            <RowCenter gap={6}>
              <StarkscanLink>{reducedHash}</StarkscanLink>
              <StyledExternalLinkIcon />
            </RowCenter>
          </Link>
        </div>

        <div>
          {blockNumber ? (
            <Link target="_blank" href={`${NETWORKS[networkId].explorerBaseUrl}/block/${blockNumber}`}>
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
          <Badge type="status" value={code ?? status} />
        </div>

        <div>
          <Badge type="origin" value={address === fromAddress} />
        </div>

        <div>
          <TYPE.small>{parsedFee ? `${parsedFee.toFixed(0)} Gwei` : 'N/A'}</TYPE.small>
        </div>

        <div>
          <TYPE.small>{transactionAge ?? 'N/A'}</TYPE.small>
        </div>
      </TxGrid>
    </StyledTransactionRow>
  )
},
MemoizedTransactionRowPropsEqualityCheck)

export default MemoizedTransactionRow
