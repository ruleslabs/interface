import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'

import Link from '@/components/Link'
import Section from '@/components/Section'
import { SearchBar } from '@/components/Input'
import { PrimaryButton } from '@/components/Button'
import Row from '@/components/Row'
import User from '@/components/User'

const UsersHeading = styled.h3`
  font-size: 18px;
  margin: 0 0 16px;
`

const StyledUsersRow = styled(Row)`
  margin-bottom: 60px;
  width: 100%;
  overflow: scroll;
`

const CERTIFIED_USERS_QUERY = gql`
  query {
    allCertifiedUsers {
      slug
      username
      profile {
        pictureUrl(derivative: "width=256")
      }
    }
  }
`

export default function Community() {
  const { data: certifiedUsersData, loading: certifiedUserLoading } = useQuery(CERTIFIED_USERS_QUERY)

  const certifiedUsers = certifiedUsersData?.allCertifiedUsers ?? []

  return (
    <>
      <Section marginBottom="84px" marginTop="44px">
        <Row gap={16}>
          <SearchBar style={{ width: '576px' }} placeholder="Chercher un collectionneur..." onUserInput={() => 0} />
          <PrimaryButton>Rechercher</PrimaryButton>
        </Row>
      </Section>
      <Section>
        <UsersHeading>Vus récemment</UsersHeading>
        <StyledUsersRow gap={32} />
        <UsersHeading>Collectionneurs certifiés</UsersHeading>
        <StyledUsersRow gap={32}>
          {certifiedUserLoading
            ? 'loading'
            : certifiedUsers.map((user: any) => (
                <Link key={`user-${user.slug}`} href={`/user/${user.slug}`}>
                  <User username={user.username} pictureUrl={user.profile.pictureUrl} certified={true} />
                </Link>
              ))}
        </StyledUsersRow>
      </Section>
    </>
  )
}
