import React, { useState, useCallback } from 'react'
import { useLazyQuery, gql } from '@apollo/client'
import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import { useSearchUsers } from '@/state/search/hooks'
import Column from '@/components/Column'
import { PaginationSpinner } from '@/components/Spinner'
import { useCurrentUser } from '@/state/user/hooks'
import { useCScoreRank } from '@/hooks/useCScore'
import UserRow from './UserRow'

const USERS_QUERY = gql`
  query ($ids: [ID!]!) {
    usersByIds(ids: $ids) {
      id
      username
      slug
      profile {
        pictureUrl(derivative: "width=128")
        fallbackUrl(derivative: "width=128")
      }
    }
    cardModelsCount
  }
`

export default function HallOfFame() {
  // current user
  const currentUser = useCurrentUser()

  // hits
  const [usersHits, setUsersHits] = useState<any[]>([])

  // tables
  const [usersTable, setUsersTable] = useState<{ [key: string]: any }>({})
  const [cardModelsCount, setCardModelsCount] = useState(0)

  // query offers data
  const onUsersQueryCompleted = useCallback(
    (data: any) => {
      // compute users table
      setUsersTable(
        (data.usersByIds as any[]).reduce<{ [key: string]: any }>((acc, user) => {
          acc[user.id] = user
          return acc
        }, {})
      )

      // card models count
      setCardModelsCount(data.cardModelsCount)

      // compute ranks
      setUsersHits(
        usersHits.reduce<any>((acc, hit) => {
          const lastHit = acc.length ? acc[acc.length - 1] : null
          acc.push({ ...hit, rank: lastHit?.cScore === hit.cScore ? lastHit.rank : acc.length + 1 })

          return acc
        }, [])
      )
    },
    [usersHits.length]
  )
  const [queryUsersData, usersQuery] = useLazyQuery(USERS_QUERY, { onCompleted: onUsersQueryCompleted })

  // top 10 search
  const onPageFetched = useCallback(
    (hits: any) => {
      setUsersHits(hits)
      queryUsersData({ variables: { ids: hits.map((hit: any) => hit.objectID) } })
    },
    [queryUsersData]
  )
  const usersSearch = useSearchUsers({ sortingKey: 'cScore', hitsPerPage: 10, onPageFetched })

  // current user rank
  const currentUserRank = useCScoreRank(currentUser?.cScore)

  // loading
  const isLoading = usersSearch.loading || usersQuery.loading

  return (
    <Column gap={12}>
      {usersHits
        .filter((hit) => usersTable[hit.objectID] && cardModelsCount && hit.rank)
        .map((hit) => (
          <UserRow
            key={hit.objectID}
            username={usersTable[hit.objectID].username}
            pictureUrl={usersTable[hit.objectID].profile.pictureUrl}
            fallbackUrl={usersTable[hit.objectID].profile.fallbackUrl}
            slug={usersTable[hit.objectID].slug}
            cScore={hit.cScore}
            rank={hit.rank}
            cardModelsCount={cardModelsCount}
          />
        ))}

      {!!currentUserRank && !!currentUser && !!cardModelsCount && (
        <>
          <div />
          <Column gap={4}>
            <UserRow
              username={currentUser.username}
              pictureUrl={currentUser.profile.pictureUrl}
              fallbackUrl={currentUser.profile.fallbackUrl}
              slug={currentUser.slug}
              cScore={currentUser.cScore}
              cardModelsCount={cardModelsCount}
            />
            <TYPE.body color="text2">
              <Trans>Your rank: {currentUserRank}</Trans>
            </TYPE.body>
          </Column>
        </>
      )}

      <PaginationSpinner loading={isLoading} />
    </Column>
  )
}
