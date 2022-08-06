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
import EmptyTab, { EmptyPacksTabOfCurrentUser } from '@/components/EmptyTab'
import PackOpeningPreparationModal from '@/components/PackOpeningPreparationModal'
import { usePackOpeningPreparationModalToggle } from '@/state/application/hooks'
import { useSetPackToPrepare } from '@/state/packOpening/hooks'

const QUERY_USER_PACKS_BALANCES = gql`
  query ($slug: String!) {
    user(slug: $slug) {
      packsBalances {
        balance
        inDeliveryBalance
        preparingOpeningBalance
        readyToOpenBalance
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

const StyledPackCard = styled(PackCard)`
  width: 100%;
`

interface CustomPackCardProps {
  packBalance: any
  state: 'inDelivery' | 'delivered' | 'preparingOpening' | 'readyToOpen'
  isOwner: boolean
}

const CustomPackCard = ({ packBalance, state, isOwner }: CustomPackCardProps) => {
  const togglePackOpeningPreparationModal = usePackOpeningPreparationModalToggle()
  const setPackToPrepare = useSetPackToPrepare()

  const onClick = useCallback(() => {
    togglePackOpeningPreparationModal()
    setPackToPrepare(packBalance.pack)
  }, [packBalance.pack, togglePackOpeningPreparationModal])

  return (
    <StyledPackCard
      slug={packBalance.pack.slug}
      name={packBalance.pack.displayName}
      releaseDate={packBalance.pack.releaseDate}
      pictureUrl={packBalance.pack.pictureUrl}
      soldout={false}
      state={state}
      isOwner={isOwner}
      onOpeningPreparation={onClick}
    />
  )
}

function Packs() {
  // current user
  const router = useRouter()
  const { username } = router.query
  const userSlug = typeof username === 'string' ? username.toLowerCase() : null

  const currentUser = useCurrentUser()
  const isCurrentUserProfile = currentUser?.slug === userSlug

  // sort
  const [increaseSort, setIncreaseSort] = useState(true)
  const toggleSort = useCallback(() => setIncreaseSort(!increaseSort), [increaseSort, setIncreaseSort])

  // query packs
  const packsBalancesQuery = useQuery(QUERY_USER_PACKS_BALANCES, { variables: { slug: userSlug }, skip: !userSlug })

  // aggregate packs
  const user = packsBalancesQuery.data?.user ?? {}
  const packsBalances = user.packsBalances ?? []

  // loading / error
  const isValid = !packsBalancesQuery.error
  const isLoading = packsBalancesQuery.loading

  // packs count
  const packsCount = useMemo(
    () =>
      (packsBalances as any[]).reduce<number>(
        (acc, packBalance) =>
          acc +
          packBalance.balance +
          packBalance.inDeliveryBalance +
          packBalance.readyToOpenBalance +
          packBalance.preparingOpeningBalance,
        0
      ),
    [packsBalances]
  )

  return (
    <>
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
        {isValid && !isLoading && packsCount ? (
          <Grid maxWidth={256}>
            {packsBalances.map((packBalance: any, index: number) => (
              <>
                {Array(packBalance.readyToOpenBalance)
                  .fill(0)
                  .map((_, index: number) => (
                    <CustomPackCard
                      key={index}
                      packBalance={packBalance}
                      state="readyToOpen"
                      isOwner={isCurrentUserProfile}
                    />
                  ))}
                {Array(packBalance.preparingOpeningBalance)
                  .fill(0)
                  .map((_, index: number) => (
                    <CustomPackCard
                      key={index}
                      packBalance={packBalance}
                      state="preparingOpening"
                      isOwner={isCurrentUserProfile}
                    />
                  ))}
                {Array(packBalance.balance)
                  .fill(0)
                  .map((_, index: number) => (
                    <CustomPackCard
                      key={index}
                      packBalance={packBalance}
                      state="delivered"
                      isOwner={isCurrentUserProfile}
                    />
                  ))}
                {Array(packBalance.inDeliveryBalance)
                  .fill(0)
                  .map((_, index: number) => (
                    <CustomPackCard
                      key={index}
                      packBalance={packBalance}
                      state="inDelivery"
                      isOwner={isCurrentUserProfile}
                    />
                  ))}
              </>
            ))}
          </Grid>
        ) : (
          isValid &&
          !isLoading &&
          (isCurrentUserProfile ? <EmptyPacksTabOfCurrentUser /> : <EmptyTab emptyText={t`No packs`} />)
        )}
      </Section>
      <PackOpeningPreparationModal onSuccess={packsBalancesQuery.refetch} />
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
