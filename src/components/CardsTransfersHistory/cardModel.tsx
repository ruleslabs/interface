import React, { useMemo, useState } from 'react'
import styled from 'styled-components/macro'
import { Trans, t } from '@lingui/macro'

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

const useSortsData = () =>
  useMemo(
    () => [
      {
        name: t`Last sales`,
        type: CardTransfersSortingType.Date,
      },
      {
        name: t`Highest sales`,
        type: CardTransfersSortingType.Price,
      },
    ],
    []
  )

interface CardModelHistoryProps {
  cardModelId: string
}

export default function CardModelHistory({ cardModelId }: CardModelHistoryProps) {
  const sortsData = useSortsData()

  const [sortingType, setSortingType] = useState(sortsData[0].type)

  const { data, loading } = useCardModelSaleTransfersQuery({
    variables: { cardModelId, sort: { direction: SortingOption.Desc, type: sortingType } },
  })
  const transfers = data?.cardModelSaleTransfers ?? []

  return (
    <>
      <SortingTitle>
        {sortsData
          .sort((sortData) => (sortData.type === sortingType ? -1 : 1))
          .map((sortData) => (
            <TYPE.body
              key={sortData.type}
              color="text2"
              fontWeight={700}
              onClick={sortData.type === sortingType ? undefined : () => setSortingType(sortData.type)}
            >
              <Trans id={sortData.name}>{sortData.name}</Trans>
            </TYPE.body>
          ))}
      </SortingTitle>

      <TransfersTable transfers={transfers} loading={loading} withSerial />
    </>
  )
}
