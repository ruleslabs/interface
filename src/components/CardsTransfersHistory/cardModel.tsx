import React, { useState } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import Row from '@/components/Row'
import { useSearchTransfers, TransfersSort } from '@/state/search/hooks'
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

interface CardModelHistoryProps extends React.HTMLAttributes<HTMLDivElement> {
  cardModelId: string
}

export default function CardModelHistory({ cardModelId, ...props }: CardModelHistoryProps) {
  const [transfersSort, setTransfersSort] = useState<keyof typeof TransfersSort>(
    Object.keys(TransfersSort)[0] as keyof typeof TransfersSort
  )

  const transfersSearch = useSearchTransfers({ facets: { cardModelId }, sortKey: transfersSort, onlySales: true })

  return (
    <>
      <SortingTitle>
        {(Object.keys(TransfersSort) as Array<keyof typeof TransfersSort>)
          .sort((a: any) => (a === transfersSort ? -1 : 1))
          .map((sort) => (
            <Trans
              key={`sorting-title-${sort}`}
              id={TransfersSort[sort].displayName}
              render={({ translation }) => (
                <TYPE.body
                  color="text2"
                  fontWeight={700}
                  onClick={sort !== transfersSort ? () => setTransfersSort(sort) : undefined}
                >
                  {translation}
                </TYPE.body>
              )}
            />
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
