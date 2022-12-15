import { useState, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
import { Plural, Trans } from '@lingui/macro'

import OffersTable from './table'
import { TYPE } from '@/styles/theme'
import { RowBetween } from '@/components/Row'
import { useSearchOffers } from '@/state/search/hooks'

const QUERY_OFFERS_USERS = gql`
  query ($ids: [ID!]!) {
    usersByIds(ids: $ids) {
      id
      slug
      username
    }
  }
`

const StyledOffersSelector = styled.div`
  background: ${({ theme }) => theme.bg2};
  border-radius: 3px;
  padding: 22px 32px;
`

const AvailabilityCount = styled(TYPE.body)`
  ${({ theme }) => theme.media.medium`
    display: none;
  `}
`

const TableTitle = styled(TYPE.large)`
  ${({ theme }) => theme.media.small`
    width: 100%;
    text-align: center;
  `}
`

interface OffersSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  cardModelId: string
  cardsOnSaleCount: number
  acceptedOfferIds: string[]
  selectedOffer: any | null
  selectOffer: (offerId: string) => void
}

export default function OffersSelector({
  cardModelId,
  cardsOnSaleCount,
  acceptedOfferIds,
  selectedOffer,
  selectOffer,
  ...props
}: OffersSelectorProps) {
  const [offers, setOffers] = useState<any[]>([])
  const [usersTable, setUsersTable] = useState<{ [key: string]: string }>({})
  const [userIds, setUserIds] = useState<string[]>([])

  const [sortDesc, setSortDesc] = useState(false)

  const toggleSort = useCallback(() => {
    setSortDesc(!sortDesc)
  }, [setSortDesc, sortDesc])

  // exclude accepted offers
  const dashedObjectIds = useMemo(() => acceptedOfferIds.map((offerId: string) => `-${offerId}`), [acceptedOfferIds])

  const offersSearch = useSearchOffers({
    facets: { cardModelId, objectID: dashedObjectIds },
    sortingKey: sortDesc ? 'priceDesc' : 'priceAsc',
  })

  useEffect(() => {
    setUserIds(
      ((offersSearch?.hits ?? []) as any[]).reduce<string[]>((acc, hit: any) => {
        if (hit.sellerUserId) acc.push(hit.sellerUserId)
        return acc
      }, [])
    )

    setOffers(offersSearch?.hits ?? [])
  }, [offersSearch?.hits])

  // query
  const offersUsersQuery = useQuery(QUERY_OFFERS_USERS, { variables: { ids: userIds }, skip: !userIds.length })

  useEffect(() => {
    setUsersTable(
      ((offersUsersQuery?.data?.usersByIds ?? []) as any[]).reduce<{ [key: string]: string }>((acc, user: any) => {
        acc[user.id] = user
        return acc
      }, {})
    )
  }, [offersUsersQuery?.data?.usersByIds])

  return (
    <StyledOffersSelector {...props}>
      <RowBetween alignItems="baseline">
        <TableTitle>
          <Trans>Select a card</Trans>
        </TableTitle>
        <AvailabilityCount>
          <Plural value={offersSearch?.nbHits ?? 0} _1="{0} available" other="{0} available" />
        </AvailabilityCount>
      </RowBetween>
      <OffersTable
        offers={offers}
        usersTable={usersTable}
        loading={offersSearch?.loading || offersUsersQuery?.loading}
        error={!!offersSearch?.error || !!offersUsersQuery?.error}
        selectedOffer={selectedOffer}
        selectOffer={selectOffer}
        sortDesc={sortDesc}
        toggleSort={toggleSort}
      />
    </StyledOffersSelector>
  )
}
