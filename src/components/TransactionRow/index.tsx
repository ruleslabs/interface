import 'moment/locale/fr'

import React, { useMemo } from 'react'
import moment from 'moment'
import styled from 'styled-components'
import { WeiAmount } from '@rulesorg/sdk-core'

import Link from '@/components/Link'
import { useActiveLocale } from '@/hooks/useActiveLocale'
import { RowCenter } from '@/components/Row'
import { TYPE } from '@/styles/theme'
import { NETWORKS, networkId } from '@/constants/networks'
import Status from './Status'
import useReduceHash from '@/hooks/useReduceHash'

import ExternalLinkIcon from '@/images/external-link.svg'

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
  status: string
  blockNumber?: number
  blockTimestamp?: Date
  actualFee?: string
}

const MemoizedTransactionRow = React.memo(function TransactionRow({
  hash,
  status,
  blockNumber,
  blockTimestamp,
  actualFee,
  ...props
}: TransactionRowProps) {
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

    console.log(new Date(blockTimestamp).getTime())

    return moment(blockTimestamp).locale(locale).fromNow(true)
  }, [blockTimestamp, locale])

  // reduce hash
  const reducedHash = useReduceHash(hash)

  // parsed fee
  const parsedFee = useMemo(() => (actualFee ? WeiAmount.fromRawAmount(actualFee, 'gwei') : undefined), [actualFee])

  return (
    <tr {...props}>
      <td>
        <Link target="_blank" href={`${NETWORKS[networkId].explorerBaseUrl}/tx/${hash}`}>
          <RowCenter gap={6}>
            <StarkscanLink>{reducedHash}</StarkscanLink>
            <StyledExternalLinkIcon />
          </RowCenter>
        </Link>
      </td>

      <td>
        {blockNumber && (
          <Link target="_blank" href={`${NETWORKS[networkId].explorerBaseUrl}/block/${blockNumber}`}>
            <RowCenter gap={6}>
              <StarkscanLink>{blockNumber}</StarkscanLink>
              <StyledExternalLinkIcon />
            </RowCenter>
          </Link>
        )}
      </td>

      <td>
        <Status status={status} />
      </td>

      <td>{parsedFee && <TYPE.small>{parsedFee.toFixed(0)} Gwei</TYPE.small>}</td>

      <td>{transactionAge && <TYPE.small>{transactionAge}</TYPE.small>}</td>
    </tr>
  )
})

export default MemoizedTransactionRow
