import { useCallback } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
import { Trans } from '@lingui/macro'
import { useRouter } from 'next/router'

import Link from '@/components/Link'
import Section from '@/components/Section'
import Row from '@/components/Row'
import User from '@/components/User'
import { useSearchedUsers } from '@/state/search/hooks'
import UsersSearchBar from '@/components/UsersSearchBar'

const UsersHeading = styled.h3`
  font-size: 18px;
  margin: 0 0 16px;
`

const StyledUsersRow = styled(Row)`
  margin-bottom: 60px;
  width: 100%;
  overflow: scroll;
  gap: 32px;
`

const CERTIFIED_USERS_QUERY = gql`
  query {
    certifiedUsersOverview {
      slug
      username
      profile {
        certified
        pictureUrl(derivative: "width=256")
      }
    }
  }
`

interface CustomUsersRowProps {
  loading?: boolean
  users: any[]
}

const UsersRow = ({ loading = false, users }: CustomUsersRowProps) => {
  return (
    <StyledUsersRow>
      {loading
        ? 'loading'
        : users.map((user: any) => (
            <Link key={`user-${user.slug}`} href={`/user/${user.slug}`}>
              <User username={user.username} pictureUrl={user.profile.pictureUrl} certified={user.profile.certified} />
            </Link>
          ))}
    </StyledUsersRow>
  )
}

export default function Community() {
  // certified
  const { data: certifiedUsersData, loading: certifiedUsersLoading } = useQuery(CERTIFIED_USERS_QUERY)
  const certifiedUsers = certifiedUsersData?.certifiedUsersOverview ?? []

  // search history
  const { searchedUsers, loading: searchedUsersLoading } = useSearchedUsers()

  // search
  const router = useRouter()
  const handleUserSelection = useCallback((user: any) => router.push(`/user/${user.slug}`), [router])

  return (
    <>
      <Section marginBottom="84px" marginTop="44px">
        <UsersSearchBar onSelect={handleUserSelection} />
      </Section>
      <Section>
        {searchedUsers.length > 0 && (
          <>
            <UsersHeading>
              <Trans>Seen recently</Trans>
            </UsersHeading>
            <UsersRow loading={searchedUsersLoading} users={searchedUsers} />
          </>
        )}
        <UsersHeading>
          <Trans>Verified collectors</Trans>
        </UsersHeading>
        <UsersRow loading={certifiedUsersLoading} users={certifiedUsers} />
      </Section>
    </>
  )
}
