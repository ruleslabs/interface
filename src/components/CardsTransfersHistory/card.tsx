import React, { useState, useEffect } from 'react'
import { useQuery, gql } from '@apollo/client'
import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import { useSearchTransfers } from '@/state/search/hooks'
import TransfersTable from './table'

const QUERY_TRANSFERS_USERS = gql`
  query ($ids: [ID!]!) {
    usersByIds(ids: $ids) {
      id
      slug
      username
      profile {
        pictureUrl(derivative: "width=128")
      }
    }
  }
`

interface CardTransfersHistoryProps extends React.HTMLAttributes<HTMLDivElement> {
  cardModelId: string
  serialNumber: number
}

export default function CardTransfersHistory({ cardModelId, serialNumber, ...props }: CardTransfersHistoryProps) {
  const [transfers, setTransfers] = useState<any[]>([])
  const [usersTable, setUsersTable] = useState<{ [key: string]: string }>({})
  const [userIds, setUserIds] = useState<string[]>([])

  const {
    hits: transfersHits,
    loading: transfersLoading,
    error: transfersError,
  } = useSearchTransfers({ facets: { cardModelId, serialNumber } })

  useEffect(() => {
    setUserIds(
      (transfersHits ?? []).reduce<string[]>((acc, hit: any) => {
        if (hit.fromUserId) acc.push(hit.fromUserId)
        if (hit.toUserId) acc.push(hit.toUserId)

        return acc
      }, [])
    )

    setTransfers(transfersHits ?? [])
  }, [transfersHits, setUserIds])

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
  } = useQuery(QUERY_TRANSFERS_USERS, { variables: { ids: userIds }, skip: !userIds.length })

  useEffect(() => {
    setUsersTable(
      ((usersData?.usersByIds ?? []) as any[]).reduce<{ [key: string]: string }>((acc, user: any) => {
        acc[user.id] = user
        return acc
      }, {})
    )
  }, [usersData, setUsersTable])

  return (
    <div {...props}>
      <TYPE.body fontSize={28} fontWeight={700}>
        <Trans>Latest sales for this card</Trans>
      </TYPE.body>
      <TransfersTable
        transfers={transfers}
        usersTable={usersTable}
        loading={usersLoading || transfersLoading}
        error={!!usersError || !!usersError}
        showSerialNumber={false}
      />
    </div>
  )
}
