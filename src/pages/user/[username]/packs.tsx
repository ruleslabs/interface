import { useState, useCallback } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
import { useRouter } from 'next/router'

import DefaultLayout from '@/components/Layout'
import ProfileLayout from '@/components/Layout/profile'
import GridHeader from '@/components/GridHeader'
import Section from '@/components/Section'
import Link from '@/components/Link'
import Grid from '@/components/Grid'
import PackCard from '@/components/PackCard'
import { TYPE } from '@/styles/theme'

const QUERY_USER_PACKS_BALANCES = gql`
  query ($slug: String!) {
    user(slug: $slug) {
      packsBalances {
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

  return (
    <Section>
      <GridHeader sortTexts={['Plus récents', 'Moins récents']} sortValue={increaseSort} onSortUpdate={toggleSort}>
        <TYPE.body>
          {!isValid
            ? 'An error has occured'
            : isLoading
            ? 'Loading...'
            : `${packsBalances.length} pack${packsBalances.length > 1 ? 's' : ''}`}
        </TYPE.body>
      </GridHeader>
      <Grid maxWidth={256}>
        {packsBalances.map((packBalance: any, index: number) => (
          <Link key={`pack-${index}`} href={`/pack/${packBalance.pack.slug}`}>
            <StyledPackCard slug={packBalance.pack.slug} pictureUrl={packBalance.pack.pictureUrl} soldout={false} />
          </Link>
        ))}
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
