import React, { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { useLazyQuery, gql } from '@apollo/client'
import { Plural, Trans } from '@lingui/macro'
import { WeiAmount } from '@rulesorg/sdk-core'

import { TYPE } from '@/styles/theme'
import { RowBetween } from '@/components/Row'
import { useSearchOffers } from '@/state/search/hooks'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import Table from '@/components/Table'
import { RadioButton } from '@/components/Button'
import Caret from '@/components/Caret'
import Link from '@/components/Link'
import { PaginationSpinner } from '@/components/Spinner'
import useInfiniteScroll from '@/hooks/useInfiniteScroll'

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

const StyledTable = styled(Table)`
  margin-top: 22px;

  ${({ theme }) => theme.media.medium`
    thead td:last-child {
      display: none;
    }
  `}
`

const StyledCaret = styled(Caret)`
  width: 10px;
  height: 10px;
  margin-left: 8px;
`

const RadioButtonWrapper = styled.td`
  width: 72px;

  ${({ theme }) => theme.media.medium`
    width: 48px;
  `}

  ${({ theme }) => theme.media.small`
    padding-left: 12px !important;
    padding-right: 8px !important;
  `}
`

const Price = styled.div`
  display: flex;
  gap: 8px;

  div {
    white-space: nowrap;
  }

  ${({ theme }) => theme.media.small`
    flex-direction: column;
    gap: 4px;
    padding-right: 12px;
  `}
`

interface OfferRowProps {
  innerRef?: (node: any) => void
  selected: boolean
  offerId: string
  onSelection: (offerId: string, serialNumber: number) => void
  username?: string
  userSlug?: string
  serialNumber: number
  price: string
}

const MemoizedOfferRowPropsEqualityCheck = (prevProps: OfferRowProps, nextProps: OfferRowProps) =>
  prevProps.cardId === nextProps.cardId && !!prevProps.innerRef === !!nextProps.innerRef

const MemoizedOfferRow = React.memo(function OfferRows({
  innerRef,
  selected,
  offerId,
  onSelection,
  username,
  userSlug,
  serialNumber,
  price,
}: OfferRowProps) {
  const { asPath } = useRouter()

  // parsed price
  const parsedPrice = useMemo(() => WeiAmount.fromRawAmount(`0x${price}`), [price])

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  return (
    <tr ref={innerRef}>
      <RadioButtonWrapper>
        <RadioButton selected={selected} onChange={() => onSelection(offerId, serialNumber)} />
      </RadioButtonWrapper>
      <td onClick={() => onSelection(offerId, serialNumber)}>
        <Price>
          <TYPE.body fontWeight={700}>{`${parsedPrice?.toSignificant(6) ?? 0} ETH`}</TYPE.body>
          <TYPE.body color="text2">{`${(parsedPrice && weiAmountToEURValue(parsedPrice)) ?? 0}€`}</TYPE.body>
        </Price>
      </td>
      <td>
        <Link href={`${asPath.replace(/buy$/, serialNumber)}`}>
          <TYPE.body clickable>#{serialNumber}</TYPE.body>
        </Link>
      </td>
      <td>
        {username && (
          <Link href={`/user/${userSlug}`}>
            <TYPE.body clickable>{username}</TYPE.body>
          </Link>
        )}
      </td>
    </tr>
  )
},
MemoizedOfferRowPropsEqualityCheck)

interface OffersSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  cardModelId: string
  acceptedOfferIds: string[]
  selectedOfferId?: string
  onSelection: (offerId: string, serialNumber: number) => void
}

export default function OffersSelector({
  cardModelId,
  acceptedOfferIds,
  selectedOfferId,
  onSelection,
  ...props
}: OffersSelectorProps) {
  // sort
  const [sortDesc, setSortDesc] = useState(false)
  const toggleSort = useCallback(() => {
    setSortDesc(!sortDesc)
  }, [setSortDesc, sortDesc])

  // exclude accepted offers
  const dashedObjectIds = useMemo(() => acceptedOfferIds.map((offerId: string) => `-${offerId}`), [acceptedOfferIds])

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

      console.log('test')

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
    sortingKey: sortDesc ? 'priceDesc' : 'priceAsc',
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
              <TYPE.medium onClick={toggleSort} style={{ cursor: 'pointer' }}>
                <Trans>Price</Trans>
                <StyledCaret direction={sortDesc ? 'bottom' : 'top'} filled />
              </TYPE.medium>
            </td>

            <td>
              <TYPE.medium>
                <Trans>Serial</Trans>
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
              <MemoizedOfferRow
                innerRef={index + 1 === offersHits.length ? lastOfferRef : undefined}
                key={hit.cardId}
                selected={selectedOfferId === hit.objectID}
                offerId={hit.objectID}
                onSelection={onSelection}
                username={usersTable[hit.sellerStarknetAddress].username}
                userSlug={usersTable[hit.sellerStarknetAddress].slug}
                serialNumber={hit.serialNumber}
                price={hit.price}
              />
            ))}
        </tbody>
      </StyledTable>
      <PaginationSpinner loading={isLoading} />
    </StyledOffersSelector>
  )
}
