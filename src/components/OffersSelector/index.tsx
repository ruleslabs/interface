import React, { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components/macro'
import { useLazyQuery, gql } from '@apollo/client'
import { Plural, Trans } from '@lingui/macro'

import { TYPE } from 'src/styles/theme'
import { RowBetween } from 'src/components/Row'
import { OffersSortingKey, useMarketplaceFilters, useSearchOffers } from 'src/state/search/hooks'
import Table from 'src/components/Table'
import Caret from 'src/components/Caret'
import { PaginationSpinner } from 'src/components/Spinner'
import useInfiniteScroll from 'src/hooks/useInfiniteScroll'
import OfferRow from './OfferRow'

const OFFERS_USERS_QUERY = gql`
  query ($starknetAddresses: [String!]!) {
    usersByStarknetAddresses(starknetAddresses: $starknetAddresses) {
      slug
      username
      starknetWallet {
        address
      }
    }
  }
`

const StyledOffersSelector = styled.div`
  background: ${({ theme }) => theme.bg2};
  border-radius: 6px;
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

const StyledTable = styled(Table)`
  margin-top: 22px;

  ${({ theme }) => theme.media.medium`
    thead td:last-child {
      display: none;
    }
  `}
`

const StyledCaret = styled(Caret)<{ selected: boolean }>`
  width: 10px;
  height: 10px;
  margin-left: 8px;
  ${({ theme, selected }) => !selected && `fill: ${theme.text2}80;`}
`

interface OffersSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  cardModelId: string
  acceptedSerialNumbers: number[]
  selectedSerialNumbers: number[]
  scarcityMaxLowSerial: number
  toggleSelection: (serialNumber: number, price: string) => void
}

export default function OffersSelector({
  cardModelId,
  acceptedSerialNumbers,
  selectedSerialNumbers,
  toggleSelection,
  scarcityMaxLowSerial,
  ...props
}: OffersSelectorProps) {
  // marketplace filters for low serial sorting
  const marketplaceFilters = useMarketplaceFilters()

  // sorts
  const [sortsDesc, setSortsDesc] = useState<any>({ price: false, serial: false })
  const [selectedSort, setSelectedSort] = useState(marketplaceFilters.lowSerials ? 'serial' : 'price')

  const toggleSortDesc = useCallback(
    (sort: string) => {
      // if sort is already selected, update its direction
      if (selectedSort === sort) setSortsDesc({ ...sortsDesc, [sort]: !sortsDesc[sort] })
      else setSelectedSort(sort)
    },
    [JSON.stringify(sortsDesc), selectedSort]
  )

  /// *Not very clean, should update this*
  const sortingKey = useMemo(
    () => `${selectedSort}${sortsDesc[selectedSort] ? 'Desc' : 'Asc'}` as OffersSortingKey,
    [selectedSort, sortsDesc[selectedSort]]
  )

  // exclude accepted offers
  const dashedObjectIds = useMemo(
    () => acceptedSerialNumbers.map((serialNumber) => `-${serialNumber}`),
    [acceptedSerialNumbers.length]
  )

  // count
  const [offersCount, setOffersCount] = useState(0)

  // hits
  const [offersHits, setOffersHits] = useState<any[]>([])
  const [pendingHits, setPendingHits] = useState<any[]>([])

  // tables
  const [usersTable, setUsersTable] = useState<{ [key: string]: any }>({})

  // query offers data
  const onOffersQueryCompleted = useCallback(
    (data: any) => {
      setUsersTable({
        ...usersTable,
        ...(data.usersByStarknetAddresses as any[]).reduce<{ [key: string]: any }>((acc, user) => {
          acc[user.starknetWallet.address] = user
          return acc
        }, {}),
      })

      setOffersHits(offersHits.concat(pendingHits))
    },
    [Object.keys(usersTable).length, offersHits.length, pendingHits]
  )
  const [queryOffersData, offersQuery] = useLazyQuery(OFFERS_USERS_QUERY, {
    onCompleted: onOffersQueryCompleted,
    fetchPolicy: 'cache-and-network',
  })

  // search offers
  const onPageFetched = useCallback(
    (hits: any, { pageNumber, totalHitsCount }) => {
      if (!pageNumber) setOffersHits([])

      queryOffersData({
        variables: {
          starknetAddresses: hits.map((hit: any) => hit.sellerStarknetAddress),
        },
      })

      setPendingHits(hits)
      setOffersCount(totalHitsCount)
    },
    [queryOffersData]
  )
  const offersSearch = useSearchOffers({
    facets: { cardModelId, objectID: dashedObjectIds },
    sortingKey,
    onPageFetched,
  })

  // loading
  const isLoading = offersSearch.loading || offersQuery.loading

  // infinite scroll
  const lastOfferRef = useInfiniteScroll({ nextPage: offersSearch.nextPage, loading: isLoading })

  return (
    <StyledOffersSelector {...props}>
      <RowBetween alignItems="baseline">
        <TableTitle>
          <Trans>Select a card</Trans>
        </TableTitle>
        <AvailabilityCount>
          <Plural value={offersCount} _1="{offersCount} available" other="{offersCount} available" />
        </AvailabilityCount>
      </RowBetween>

      <StyledTable>
        <thead>
          <tr>
            <td />

            <td>
              <TYPE.medium onClick={() => toggleSortDesc('price')} style={{ cursor: 'pointer' }}>
                <Trans>Price</Trans>
                <StyledCaret
                  direction={sortsDesc.price ? 'bottom' : 'top'}
                  selected={selectedSort === 'price'}
                  filled
                />
              </TYPE.medium>
            </td>

            <td>
              <TYPE.medium onClick={() => toggleSortDesc('serial')} style={{ cursor: 'pointer' }}>
                <Trans>Serial</Trans>
                <StyledCaret
                  direction={sortsDesc.serial ? 'bottom' : 'top'}
                  selected={selectedSort === 'serial'}
                  filled
                />
              </TYPE.medium>
            </td>

            <td>
              <TYPE.medium>
                <Trans>Seller</Trans>
              </TYPE.medium>
            </td>
            <td style={{ width: '100px' }} />
          </tr>
        </thead>

        <tbody>
          {offersHits
            .filter((hit) => usersTable[hit.sellerStarknetAddress])
            .map((hit, index) => (
              <OfferRow
                innerRef={index + 1 === offersHits.length ? lastOfferRef : undefined}
                key={hit.cardId}
                selected={selectedSerialNumbers.includes(hit.serialNumber)}
                toggleSelection={toggleSelection}
                username={usersTable[hit.sellerStarknetAddress].username}
                userSlug={usersTable[hit.sellerStarknetAddress].slug}
                serialNumber={hit.serialNumber}
                scarcityMaxLowSerial={scarcityMaxLowSerial}
                price={hit.price}
              />
            ))}
        </tbody>
      </StyledTable>
      <PaginationSpinner loading={isLoading} />
    </StyledOffersSelector>
  )
}
