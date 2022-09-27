import React from 'react'
import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import { useSearchTransfers } from '@/state/search/hooks'
import TransfersTable from './table'

interface CardTransfersHistoryProps extends React.HTMLAttributes<HTMLDivElement> {
  cardModelId: string
  serialNumber: number
}

export default function CardTransfersHistory({ cardModelId, serialNumber, ...props }: CardTransfersHistoryProps) {
  const transfersSearch = useSearchTransfers({ facets: { cardModelId, serialNumber } })

  return (
    <div {...props}>
      <TYPE.body fontSize={28} fontWeight={700}>
        <Trans>Latest sales for this card</Trans>
      </TYPE.body>
      <TransfersTable
        transfers={transfersSearch.hits}
        loading={transfersSearch.loading}
        error={!!transfersSearch.error}
        showSerialNumber={false}
      />
    </div>
  )
}
