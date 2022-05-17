import React, { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
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

export default function CardModelHistory({ cardModelId, ...props }: CardModelHistoryProps) {
  const [transfersSort, setTransfersSort] = useState<keyof typeof TransfersSort>(
    Object.keys(TransfersSort)[0] as keyof typeof TransfersSort
  )

  const [transfers, setTransfers] = useState<any[]>([])
  const [usersTable, setUsersTable] = useState<{ [key: string]: string }>({})

  const {
    hits: transfersHits,
    loading: transfersLoading,
    error: transfersError,
  } = useSearchTransfers({ facets: { cardModelId }, sortKey: transfersSort })

  const userIds = useMemo(
    () =>
      (transfersHits ?? []).reduce<string[]>((acc, hit: any) => {
        if (hit.fromUserId) acc.push(hit.fromUserId)
        if (hit.toUserId) acc.push(hit.toUserId)

        return acc
      }, []),
    [transfersHits]
  )

  useEffect(() => setTransfers(transfersHits ?? []), [transfersHits, setTransfers])

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
  } = useQuery(QUERY_TRANSFERS_USERS, { variables: { ids: userIds }, skip: !userIds.length })

  useEffect(() => {
    if (!usersData?.usersByIds) return

    setUsersTable(
      (usersData?.usersByIds as any[]).reduce<{ [key: string]: string }>((acc, user: any) => {
        acc[user.id] = user
        return acc
      }, {})
    )
  }, [usersData, setUsersTable])

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
        transfers={transfers}
        usersTable={usersTable}
        loading={usersLoading || transfersLoading}
        error={!!usersError || !!usersError}
        showSerialNumber={true}
      />
    </>
  )
}
