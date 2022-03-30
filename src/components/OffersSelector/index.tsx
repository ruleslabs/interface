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
  padding: 32px;
  width: 100%;
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
        <TYPE.body fontSize={28} fontWeight={700}>
          Sélectionnez un exemplaire
        </TYPE.body>
        <TYPE.body>
          {cardsOnSaleCount} disponible{cardsOnSaleCount > 1 ? 's' : ''}
        </TYPE.body>
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
      />
    </StyledOffersSelector>
  )
}
