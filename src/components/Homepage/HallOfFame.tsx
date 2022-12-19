import React, { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { useLazyQuery, gql } from '@apollo/client'
import { parseCScore } from '@rulesorg/sdk-core'
import { Trans } from '@lingui/macro'

import shortenUsername from '@/utils/shortenUsername'
import { TYPE } from '@/styles/theme'
import { useSearchUsers } from '@/state/search/hooks'
import Link from '@/components/Link'
import Column from '@/components/Column'
import { RowCenter } from '@/components/Row'
import { PaginationSpinner } from '@/components/Spinner'
import Tooltip from '@/components/Tooltip'
import { useCurrentUser } from '@/state/user/hooks'

const USERS_QUERY = gql`
  query ($ids: [ID!]!) {
    usersByIds(ids: $ids) {
      id
      username
      slug
      profile {
        pictureUrl(derivative: "width=128")
      }
    }
    cardModelsCount
  }
`

const StyledUserRow = styled(RowCenter)`
  gap: 12px;
  position: relative;

  img {
    border-radius: 50%;
    width: 26px;
    height: 26px;
  }
`

const Medal = styled(TYPE.medium)`
  position: absolute;
  top: 8px;
  left: 14px;
`

const Rank = styled(RowCenter)<{ rank: number }>`
  background: ${({ theme }) => theme.bg1};
  border-radius: 50%;
  width: 26px;
  height: 26px;

  * {
    width: 100%;
    text-align: center;
  }
`

const StyledTooltip = styled(Tooltip)`
  width: 212px;
  right: -234px;
  bottom: 10px;
  box-shadow: 0 0 4px #00000020;
  transform: translateY(50%);
`

const CScore = styled(TYPE.body)`
  position: relative;

  &:hover > div {
    display: unset;
  }
`

interface UserRowProps {
  cScore: number
  cardModelsCount: number
  username: string
  pictureUrl: string
  slug: string
  rank?: number
}

const MemoizedUserRowPropsEqualityCheck = (prevProps: UserRowProps, nextProps: UserRowProps) =>
  prevProps.slug === nextProps.slug

const MemoizedUserRow = React.memo(function UserRow({
  cScore,
  cardModelsCount,
  username,
  pictureUrl,
  slug,
  rank = 0,
}: UserRowProps) {
  // shorten username
  const shortUsername = useMemo(() => shortenUsername(username), [username])

  // parsed price
  const parsedCScore = useMemo(() => {
    const parsedCScore = parseCScore(cScore)

    return {
      cardsCount: parsedCScore.cardsCount,
      cardModelsPercentage: cardModelsCount ? (parsedCScore.cardModelsCount / cardModelsCount) * 100 : 0,
    }
  }, [cScore, cardModelsCount])

  return (
    <StyledUserRow>
      <Link href={`/user/${slug}`}>
        {rank <= 3 ? (
          <>
            <img src={pictureUrl} />
            {!!rank && <Medal>{rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</Medal>}
          </>
        ) : (
          <Rank>
            <TYPE.body>{rank}.</TYPE.body>
          </Rank>
        )}
      </Link>

      <Link href={`/user/${slug}`}>
        <TYPE.body clickable>{shortUsername}</TYPE.body>
      </Link>

      <CScore>
        <TYPE.body color="text2">
          {parsedCScore.cardModelsPercentage.toFixed(0)}% - {parsedCScore.cardsCount}
        </TYPE.body>

        <StyledTooltip direction="left">
          <TYPE.body>
            <Trans>
              Collection {parsedCScore.cardModelsPercentage.toFixed(0)}% complete. This collector has{' '}
              {parsedCScore.cardsCount} cards.
            </Trans>
          </TYPE.body>
        </StyledTooltip>
      </CScore>
    </StyledUserRow>
  )
},
MemoizedUserRowPropsEqualityCheck)

export default function HallOfFame() {
  // current user
  const currentUser = useCurrentUser()

  // hits
  const [usersHits, setUsersHits] = useState<any[]>([])

  // tables
  const [usersTable, setUsersTable] = useState<{ [key: string]: any }>({})
  const [cardModelsCount, setCardModelsCount] = useState(0)

  // query offers data
  const onTransfersQueryCompleted = useCallback(
    (data: any) => {
      // compute users table
      setUsersTable(
        data.usersByIds.reduce<{ [key: string]: any }>((acc, user) => {
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
  const [queryUsersData, usersQuery] = useLazyQuery(USERS_QUERY, { onCompleted: onTransfersQueryCompleted })

  // top 10 search
  const onPageFetched = useCallback(
    (hits: any) => {
      setUsersHits(hits)
      queryUsersData({ variables: { ids: hits.map((hit) => hit.objectID) } })
    },
    [queryUsersData]
  )
  const usersSearch = useSearchUsers({ sortingKey: 'cScore', hitsPerPage: 10, onPageFetched })

  // current user cscore
  const currentUserSearch = useSearchUsers({
    hitsPerPage: 1,
    facets: { userId: currentUser?.id },
    skip: !currentUser?.id,
  })
  const currentUserCScore = currentUserSearch?.hits?.[0]?.cScore ?? 0

  // current user rank
  const currentUserRankSearch = useSearchUsers({
    sortingKey: 'cScore',
    hitsPerPage: 0,
    filters: `cScore > ${currentUserCScore}`,
    skip: !currentUserCScore,
  })
  const currentUserRank = useMemo(
    () => (currentUserRankSearch?.nbHits ? currentUserRankSearch?.nbHits + 1 : 0),
    [currentUserRankSearch?.nbHits]
  )

  // loading
  const isLoading =
    usersSearch.loading || usersQuery.loading || currentUserSearch.loading || currentUserRankSearch.loading

  return (
    <Column gap={12}>
      {usersHits
        .filter((hit) => usersTable[hit.objectID] && cardModelsCount && hit.rank)
        .map((hit) => (
          <MemoizedUserRow
            key={hit.objectID}
            username={usersTable[hit.objectID].username}
            pictureUrl={usersTable[hit.objectID].profile.pictureUrl}
            slug={usersTable[hit.objectID].slug}
            cScore={hit.cScore}
            rank={hit.rank}
            cardModelsCount={cardModelsCount}
          />
        ))}

      {!!currentUserRank && currentUser && !!cardModelsCount && (
        <>
          <div />
          <Column gap={4}>
            <MemoizedUserRow
              username={currentUser.username}
              pictureUrl={currentUser.profile.pictureUrl}
              slug={currentUser.slug}
              cScore={currentUserCScore}
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
