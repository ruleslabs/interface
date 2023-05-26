import { useCallback } from 'react'
import styled from 'styled-components/macro'
import { useQuery, gql } from '@apollo/client'
import { t } from '@lingui/macro'
import { useNavigate } from 'react-router-dom'

import Link from 'src/components/Link'
import Section from 'src/components/Section'
import Row, { RowCenter } from 'src/components/Row'
import { useSearchedUsers } from 'src/state/search/hooks'
import UsersSearchBar from 'src/components/UsersSearchBar'
import Avatar from 'src/components/Avatar'
import { CertifiedBadge, TopCollectorBadge } from 'src/components/User/Badge'
import { useCScoreTopCollector } from 'src/hooks/useCScore'
import Column, { ColumnCenter } from 'src/components/Column'
import { PaginationSpinner } from 'src/components/Spinner'
import Subtitle from 'src/components/Text/Subtitle'
import { TYPE } from 'src/styles/theme'
import DefaultLayout from 'src/components/Layout'

const UsersRow = styled(Row)`
  width: 100%;
  flex-wrap: wrap;
  gap: 32px;

  img {
    width: 145px;
  }
`

const CERTIFIED_USERS_QUERY = gql`
  query {
    certifiedUsersOverview {
      slug
      username
      cScore
      profile {
        certified
        pictureUrl(derivative: "width=256")
        fallbackUrl(derivative: "width=256")
      }
    }
  }
`

interface CustomUsersRowProps {
  username: string
  pictureUrl: string
  fallbackUrl: string
  certified: boolean
  cScore: number
}

function User({ username, pictureUrl, fallbackUrl, certified, cScore }: CustomUsersRowProps) {
  const isTopCollector = useCScoreTopCollector(cScore)

  return (
    <ColumnCenter gap={8}>
      <Link href={`/user/${username}`}>
        <Avatar src={pictureUrl} fallbackSrc={fallbackUrl} />
      </Link>

      <RowCenter gap={4}>
        <Link href={`/user/${username}`}>
          <TYPE.body clickable>{username}</TYPE.body>
        </Link>

        {certified && <CertifiedBadge />}
        {isTopCollector && <TopCollectorBadge />}
      </RowCenter>
    </ColumnCenter>
  )
}

function Community() {
  // nav
  const navigate = useNavigate()

  // search history
  const searchedUsersQuery = useSearchedUsers()
  const searchedUsers = searchedUsersQuery.searchedUsers

  // certified
  const certifiedUsersQuery = useQuery(CERTIFIED_USERS_QUERY)
  const certifiedUsers = (certifiedUsersQuery.data?.certifiedUsersOverview ?? []) as any[]

  // search
  const handleUserSelection = useCallback((user: any) => navigate(`/user/${user.slug}`), [navigate])

  // loading
  const isLoading = searchedUsersQuery.loading || certifiedUsersQuery.loading

  return (
    <>
      <Section marginBottom="84px" marginTop="44px">
        <UsersSearchBar onSelect={handleUserSelection} />
      </Section>
      <Section>
        {!isLoading && (
          <Column gap={64}>
            <Column gap={16}>
              <Subtitle value={t`Seen recently`} />

              <UsersRow>
                {searchedUsers.map((user) => (
                  <User
                    key={user.username}
                    username={user.username}
                    pictureUrl={user.profile.pictureUrl}
                    fallbackUrl={user.profile.fallbackUrl}
                    certified={user.profile.certified}
                    cScore={user.cScore}
                  />
                ))}
              </UsersRow>
            </Column>

            <Column gap={16}>
              <Subtitle value={t`Verified collectors`} />

              <UsersRow>
                {certifiedUsers.map((user) => (
                  <User
                    key={user.username}
                    username={user.username}
                    pictureUrl={user.profile.pictureUrl}
                    fallbackUrl={user.profile.fallbackUrl}
                    certified={user.profile.certified}
                    cScore={user.cScore}
                  />
                ))}
              </UsersRow>
            </Column>
          </Column>
        )}

        <PaginationSpinner loading={isLoading} />
      </Section>
    </>
  )
}

Community.withLayout = () => (
  <DefaultLayout>
    <Community />
  </DefaultLayout>
)

export default Community
