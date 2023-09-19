import { useState } from 'react'
import { Trans } from '@lingui/macro'
import { constants } from '@rulesorg/sdk-core'

import { TYPE } from 'src/styles/theme'
import Column from 'src/components/Column'
import { PaginationSpinner } from 'src/components/Spinner'
import useCurrentUser from 'src/hooks/useCurrentUser'
import UserRow from './UserRow'
import { useCurrentUserHallOfFame, useHallOfFame } from 'src/graphql/data/users'
import SeasonSelector from 'src/components/SeasonSelector'

export default function HallOfFame() {
  // current user
  const { currentUser } = useCurrentUser()

  // season
  const [selectedSeason, setSelectedSeason] = useState(constants.CURRENT_SEASON)

  // query hall of fame
  const hallOfFameQuery = useHallOfFame(selectedSeason)
  const hallOfFame = hallOfFameQuery.data ?? []

  // query current user hall of fame
  const currentUserHallOfFameQuery = useCurrentUserHallOfFame(selectedSeason)
  const currentUserHallOfFame = currentUserHallOfFameQuery.data

  // loading
  const loading = hallOfFameQuery.loading || currentUserHallOfFameQuery.loading

  if (loading) {
    return <PaginationSpinner loading={loading} />
  }

  return (
    <Column gap={12}>
      {hallOfFame.map((user) => (
        <UserRow
          key={user.username}
          username={user.username}
          pictureUrl={user.profile.pictureUrl}
          fallbackUrl={user.profile.fallbackUrl}
          slug={user.slug}
          cScore={user.cScore}
          rank={user.rank}
        />
      ))}

      {currentUser && currentUserHallOfFame && (
        <>
          <div />
          <Column gap={4}>
            <UserRow
              username={currentUser.username}
              pictureUrl={currentUser.profile.pictureUrl}
              fallbackUrl={currentUser.profile.fallbackUrl}
              slug={currentUser.slug}
              cScore={currentUserHallOfFame.cScore}
            />
            <TYPE.body color="text2">
              <Trans>Your rank: {currentUserHallOfFame.rank}</Trans>
            </TYPE.body>
          </Column>
        </>
      )}

      <SeasonSelector selectedSeason={selectedSeason} selectSeason={setSelectedSeason} />
    </Column>
  )
}
