import React, { useState } from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'

import { TYPE } from 'src/styles/theme'
import Row from 'src/components/Row'
import TransfersTable from './table'
import {
  CardTransfersSortingType,
  SortingOption,
  useCardModelSaleTransfersQuery,
} from 'src/graphql/data/__generated__/types-and-hooks'

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

const sorts = [
  {
    name: 'Last sales',
    type: CardTransfersSortingType.Date,
  },
  {
    name: 'Highest sales',
    type: CardTransfersSortingType.Price,
  },
]

interface CardModelHistoryProps {
  cardModelId: string
}

export default function CardModelHistory({ cardModelId }: CardModelHistoryProps) {
  const [sortingType, setSortingType] = useState(sorts[0].type)

  const { data, loading } = useCardModelSaleTransfersQuery({
    variables: { cardModelId, sort: { direction: SortingOption.Desc, type: sortingType } },
  })
  const transfers = data?.cardModelSaleTransfers ?? []

  return (
    <>
      <SortingTitle>
        {sorts
          .sort((sort) => (sort.type === sortingType ? -1 : 1))
          .map((sort) => (
            <TYPE.body
              key={sort.type}
              color="text2"
              fontWeight={700}
              onClick={sort.type === sortingType ? undefined : () => setSortingType(sort.type)}
            >
              <Trans id={sort.name}>{sort.name}</Trans>
            </TYPE.body>
          ))}
      </SortingTitle>

      <TransfersTable transfers={transfers} loading={loading} withSerial />
    </>
  )
}
