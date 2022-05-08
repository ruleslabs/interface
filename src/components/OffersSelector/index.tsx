import { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'

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
  selectedOffer: any | null
  selectOffer: (offer: any) => void
}

export default function OffersSelector({
  cardModelId,
  cardsOnSaleCount,
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

  const {
    hits: offersHits,
    loading: offersLoading,
    error: offersError,
  } = useSearchOffers({ facets: { cardModelId }, priceDesc: sortDesc })

  useEffect(() => {
    setUserIds(
      ((offersHits ?? []) as any[]).reduce<string[]>((acc, hit: any) => {
        if (hit.fromUserId) acc.push(hit.fromUserId)
        return acc
      }, [])
    )

    setOffers(offersHits ?? [])
  }, [offersHits, setUserIds])

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
  } = useQuery(QUERY_OFFERS_USERS, { variables: { ids: userIds }, skip: !userIds.length })

  useEffect(() => {
    setUsersTable(
      ((usersData?.usersByIds ?? []) as any[]).reduce<{ [key: string]: string }>((acc, user: any) => {
        acc[user.id] = user
        return acc
      }, {})
    )
  }, [usersData, setUsersTable])

  return (
    <StyledOffersSelector {...props}>
      <RowBetween alignItems="baseline">
        <TableTitle>Select a card</TableTitle>
        <AvailabilityCount>
          {cardsOnSaleCount} disponible{cardsOnSaleCount > 1 ? 's' : ''}
        </AvailabilityCount>
      </RowBetween>
      <OffersTable
        offers={offers}
        usersTable={usersTable}
        loading={usersLoading || offersLoading}
        error={!!usersError || !!offersError}
        selectedOffer={selectedOffer}
        selectOffer={selectOffer}
        sortDesc={sortDesc}
        toggleSort={toggleSort}
        cardsOnSaleCount={cardsOnSaleCount}
      />
    </StyledOffersSelector>
  )
}
