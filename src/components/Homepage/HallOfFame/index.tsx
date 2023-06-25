import { Trans } from '@lingui/macro'

import { TYPE } from 'src/styles/theme'
import Column from 'src/components/Column'
import { PaginationSpinner } from 'src/components/Spinner'
import useCurrentUser from 'src/hooks/useCurrentUser'
import UserRow from './UserRow'
import { useHallOfFame } from 'src/graphql/data/users'

export default function HallOfFame() {
  // current user
  const { currentUser } = useCurrentUser()

  // query offers data
  const { data, loading } = useHallOfFame()
  const users = data ?? []

  return (
    <Column gap={12}>
      <PaginationSpinner loading={loading} />

      {users.map((user) => (
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

      {!!currentUser && (
        <>
          <div />
          <Column gap={4}>
            <UserRow
              username={currentUser.username}
              pictureUrl={currentUser.profile.pictureUrl}
              fallbackUrl={currentUser.profile.fallbackUrl}
              slug={currentUser.slug}
              cScore={currentUser.cScore}
            />
            <TYPE.body color="text2">
              <Trans>Your rank: {currentUser.rank}</Trans>
            </TYPE.body>
          </Column>
        </>
      )}
    </Column>
  )
}
