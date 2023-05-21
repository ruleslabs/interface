import { useMemo } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
import { useRouter } from 'next/router'
import { Plural, t } from '@lingui/macro'

import DefaultLayout from '@/components/Layout'
import ProfileLayout from '@/components/Layout/Profile'
import Section from '@/components/Section'
import Grid from '@/components/Grid'
import PackCard from '@/components/Pack'
import { TYPE } from '@/styles/theme'
import { RowBetween } from '@/components/Row'
import useCurrentUser from '@/hooks/useCurrentUser'
import EmptyTab, { EmptyPacksTabOfCurrentUser } from '@/components/EmptyTab'
import { PaginationSpinner } from '@/components/Spinner'

const USER_PACKS_BALANCES_QUERY = gql`
  query ($slug: String!) {
    user(slug: $slug) {
      packsBalances {
        balance
        inDeliveryBalance
        openedBalance
        pack {
          id
          slug
          displayName
          releaseDate
          pictureUrl(derivative: "width=320")
        }
      }
    }
  }
`

const GridHeader = styled(RowBetween)`
  margin-bottom: 32px;
  padding: 0 8px;
  align-items: center;
`

const StyledPackCard = styled(PackCard)`
  width: 100%;
`

function Packs() {
  // current user
  const router = useRouter()
  const { username } = router.query
  const userSlug = typeof username === 'string' ? username.toLowerCase() : null

  const { currentUser } = useCurrentUser()
  const isCurrentUserProfile = currentUser?.slug === userSlug

  // query packs
  const packsBalancesQuery = useQuery(USER_PACKS_BALANCES_QUERY, { variables: { slug: userSlug }, skip: !userSlug })

  // aggregate packs
  const user = packsBalancesQuery.data?.user ?? {}
  const packsBalances = user.packsBalances ?? []

  // loading / error
  const isLoading = packsBalancesQuery.loading

  // packs count
  const packsCount = useMemo(
    () =>
      (packsBalances as any[]).reduce<{ opened: number; sealed: number }>(
        (acc, packBalance) => {
          acc.opened += packBalance.openedBalance
          acc.sealed += packBalance.balance + packBalance.inDeliveryBalance

          return acc
        },
        { opened: 0, sealed: 0 }
      ),
    [packsBalances]
  )

  return (
    <>
      <Section marginTop="32px">
        {packsCount.sealed > 0 && (
          <GridHeader>
            <TYPE.body>
              <Plural value={packsCount.sealed} _1="{0} sealed pack" other="{0} sealed packs" />
            </TYPE.body>
          </GridHeader>
        )}

        {packsCount.sealed ? (
          <Grid>
            {packsBalances.map((packBalance: any) => (
              <>
                {Array(packBalance.inDeliveryBalance)
                  .fill(0)
                  .map((_, index: number) => (
                    <StyledPackCard
                      key={index}
                      slug={packBalance.pack.slug}
                      name={packBalance.pack.displayName}
                      releaseDate={packBalance.pack.releaseDate}
                      pictureUrl={packBalance.pack.pictureUrl}
                      state="inDelivery"
                    />
                  ))}
                {Array(packBalance.balance)
                  .fill(0)
                  .map((_, index: number) => (
                    <StyledPackCard
                      key={index}
                      slug={packBalance.pack.slug}
                      name={packBalance.pack.displayName}
                      releaseDate={packBalance.pack.releaseDate}
                      pictureUrl={packBalance.pack.pictureUrl}
                      isOwner={isCurrentUserProfile}
                    />
                  ))}
              </>
            ))}
          </Grid>
        ) : (
          !isLoading && (isCurrentUserProfile ? <EmptyPacksTabOfCurrentUser /> : <EmptyTab emptyText={t`No packs`} />)
        )}

        <PaginationSpinner loading={isLoading} />
      </Section>

      <Section>
        {packsCount.opened > 0 && (
          <>
            <GridHeader>
              <TYPE.body>
                <Plural value={packsCount.opened} _1="{0} opened pack" other="{0} opened packs" />
              </TYPE.body>
            </GridHeader>

            <Grid>
              {packsBalances.map((packBalance: any) =>
                Array(packBalance.openedBalance)
                  .fill(0)
                  .map((_, index: number) => (
                    <StyledPackCard
                      key={index}
                      slug={packBalance.pack.slug}
                      name={packBalance.pack.displayName}
                      releaseDate={packBalance.pack.releaseDate}
                      pictureUrl={packBalance.pack.pictureUrl}
                      isOwner={isCurrentUserProfile}
                      state="opened"
                    />
                  ))
              )}
            </Grid>
          </>
        )}
      </Section>
    </>
  )
}

Packs.getLayout = (page: JSX.Element) => {
  return (
    <DefaultLayout>
      <ProfileLayout>{page}</ProfileLayout>
    </DefaultLayout>
  )
}

export default Packs
