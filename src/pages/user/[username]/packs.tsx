import { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
import { useRouter } from 'next/router'
import { Plural, t } from '@lingui/macro'

import DefaultLayout from '@/components/Layout'
import ProfileLayout from '@/components/Layout/Profile'
import GridHeader from '@/components/GridHeader'
import Section from '@/components/Section'
import Grid from '@/components/Grid'
import PackCard from '@/components/PackCard'
import { TYPE } from '@/styles/theme'
import { useCurrentUser } from '@/state/user/hooks'

const QUERY_USER_PACKS_BALANCES = gql`
  query ($slug: String!) {
    user(slug: $slug) {
      packsBalances {
        balance
        pack {
          slug
          pictureUrl(derivative: "width=320")
        }
      }
    }
  }
`

const StyledPackCard = styled(PackCard)`
  width: 100%;
`

function Packs({ userId }: { userId: string }) {
  const router = useRouter()
  const { username } = router.query
  const userSlug = typeof username === 'string' ? username.toLowerCase() : null

  const currentUser = useCurrentUser()
  const isCurrentUserProfile = currentUser?.slug === userSlug

  const [increaseSort, setIncreaseSort] = useState(true)

  const toggleSort = useCallback(() => {
    setIncreaseSort(!increaseSort)
  }, [increaseSort, setIncreaseSort])

  const {
    data: packsBalancesData,
    loading,
    error,
  } = useQuery(QUERY_USER_PACKS_BALANCES, { variables: { slug: userSlug }, skip: !userId })

  const packsBalances = packsBalancesData?.user?.packsBalances ?? []
  const isValid = !error
  const isLoading = loading

  const packsCount = useMemo(
    () => ((packsBalances ?? []) as any[]).reduce<number>((acc, packBalance) => acc + packBalance.balance, 0),
    [packsBalances]
  )

  return (
    <Section>
      <GridHeader sortTexts={['Newest', 'Oldest']} sortValue={increaseSort} onSortUpdate={toggleSort}>
        <TYPE.body>
          {isLoading ? (
            'Loading...'
          ) : !isValid ? (
            t`An error has occured`
          ) : (
            <Plural value={packsCount} _1="{packsCount} pack" other="{packsCount} packs" />
          )}
        </TYPE.body>
      </GridHeader>
      <Grid maxWidth={256}>
        {packsBalances.map((packBalance: any, index: number) =>
          Array(packBalance.balance)
            .fill(0)
            .map((_, index: number) => (
              <StyledPackCard
                key={`pack-${packBalance.pack.slug}-${index}`}
                slug={packBalance.pack.slug}
                pictureUrl={packBalance.pack.pictureUrl}
                soldout={false}
                open={isCurrentUserProfile}
              />
            ))
        )}
      </Grid>
    </Section>
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
