import React, { useState } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import Row from '@/components/Row'
import { useSearchTransfers, TransfersSortingKey } from '@/state/search/hooks'
import TransfersTable from './table'

const SortingTitle = styled(Row)`
  align-items: baseline;
  gap: 16px;

  *:first-child {
    font-size: 28px;
    color: ${({ theme }) => theme.text1};
  }

  *:not(:first-child):hover {
    color: ${({ theme }) => theme.text1};
    cursor: pointer;
  }
`

const sorts: Array<{
  name: string
  key: TransfersSortingKey
}> = [
  {
    name: 'Last sales',
    key: 'txIndexDesc',
  },
  {
    name: 'Highest sales',
    key: 'priceDesc',
  },
]

interface CardModelHistoryProps {
  cardModelId: string
}

export default function CardModelHistory({ cardModelId }: CardModelHistoryProps) {
  const [sortingKey, setSortingKey] = useState<TransfersSortingKey>(sorts[0].key)

  const transfersSearch = useSearchTransfers({ facets: { cardModelId }, sortingKey, onlySales: true })

  return (
    <>
      <SortingTitle>
        {sorts
          .sort((sort) => (sort.key === sortingKey ? -1 : 1))
          .map((sort) => (
            <TYPE.body
              key={sort.key}
              color="text2"
              fontWeight={700}
              onClick={sort.key === sortingKey ? undefined : () => setSortingKey(sort.key)}
            >
              <Trans id={sort.name} render={({ translation }) => <>{translation}</>} />
            </TYPE.body>
          ))}
      </SortingTitle>

      <TransfersTable
        transfers={transfersSearch.hits}
        loading={transfersSearch.loading}
        error={!!transfersSearch.error}
        showSerialNumber={true}
      />
    </>
  )
}
