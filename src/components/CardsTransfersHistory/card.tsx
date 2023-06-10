import React from 'react'
import { Trans } from '@lingui/macro'

import { TYPE } from 'src/styles/theme'
import TransfersTable from './table'
import {
  CardTransfersSortingType,
  SortingOption,
  useCardTransfersQuery,
} from 'src/graphql/data/__generated__/types-and-hooks'

interface CardTransfersHistoryProps extends React.HTMLAttributes<HTMLDivElement> {
  tokenId: string
}

export default function CardTransfersHistory({ tokenId, ...props }: CardTransfersHistoryProps) {
  const { data, loading } = useCardTransfersQuery({
    variables: { tokenId, sort: { direction: SortingOption.Desc, type: CardTransfersSortingType.Date } },
  })
  const transfers = data?.cardTransfers ?? []

  return (
    <div {...props}>
      <TYPE.body fontSize={28} fontWeight={700}>
        <Trans>Latest sales for this card</Trans>
      </TYPE.body>
      <TransfersTable transfers={transfers} loading={loading} />
    </div>
  )
}
