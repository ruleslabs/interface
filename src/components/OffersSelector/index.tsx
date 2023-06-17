import React, { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components/macro'
import { Plural, Trans } from '@lingui/macro'

import { TYPE } from 'src/styles/theme'
import { RowBetween } from 'src/components/Row'
import { useMarketplaceFilters } from 'src/state/search/hooks'
import Table from 'src/components/Table'
import Caret from 'src/components/Caret'
import { PaginationSpinner } from 'src/components/Spinner'
import OfferRow from './OfferRow'
import { useCardListings } from 'src/graphql/data/CardListings'
import { CardListingsSortingType, SortingOption } from 'src/graphql/data/__generated__/types-and-hooks'
import InfiniteScroll from 'react-infinite-scroll-component'

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
  listedCardsCount: number
  acceptedSerialNumbers: number[]
  selectedSerialNumbers: number[]
  scarcityMaxLowSerial: number
  toggleSelection: (serialNumber: number, price: string) => void
}

export default function OffersSelector({
  cardModelId,
  listedCardsCount,
  // acceptedSerialNumbers,
  selectedSerialNumbers,
  toggleSelection,
  scarcityMaxLowSerial,
  ...props
}: OffersSelectorProps) {
  // marketplace filters for low serial sorting
  const marketplaceFilters = useMarketplaceFilters()

  // sorts
  const [sortDirection, setSortDirection] = useState<SortingOption>(SortingOption.Asc)
  const [sortingType, setSortingType] = useState(
    marketplaceFilters.lowSerials ? CardListingsSortingType.SerialNumber : CardListingsSortingType.Price
  )

  const toggleSort = useCallback(
    (sortingType: CardListingsSortingType) => {
      // if sort is already selected, update its direction
      if (sortingType === sortingType) {
        setSortDirection((direction) => {
          switch (direction) {
            case SortingOption.Asc:
              return SortingOption.Desc
            case SortingOption.Desc:
              return SortingOption.Asc
          }
        })
      } else {
        setSortingType(sortingType)
      }
    },
    [sortingType]
  )

  const {
    data: cardListings,
    hasNext,
    loadMore,
  } = useCardListings({
    sort: { type: sortingType, direction: sortDirection },
    filter: { cardModelId },
  })

  const listingsComponents = useMemo(() => {
    if (!cardListings) return null

    return cardListings.map((cardListing) => {
      const card = cardListing.card
      const offerer = cardListing.offerer

      return (
        <OfferRow
          key={cardListing.orderSigningData.salt}
          selected={selectedSerialNumbers.includes(card.serialNumber)}
          toggleSelection={toggleSelection}
          username={offerer.profile.username}
          userSlug={offerer.profile.slug}
          serialNumber={card.serialNumber}
          scarcityMaxLowSerial={scarcityMaxLowSerial}
          price={cardListing.price}
        />
      )
    })
  }, [cardListings])

  return (
    <StyledOffersSelector {...props}>
      <RowBetween alignItems="baseline">
        <TableTitle>
          <Trans>Select a card</Trans>
        </TableTitle>
        <AvailabilityCount>
          <Plural value={listedCardsCount} _1="{listedCardsCount} available" other="{listedCardsCount} available" />
        </AvailabilityCount>
      </RowBetween>

      <StyledTable>
        <thead>
          <tr>
            <td />

            <td>
              <TYPE.medium onClick={() => toggleSort(CardListingsSortingType.Price)} style={{ cursor: 'pointer' }}>
                <Trans>Price</Trans>
                <StyledCaret
                  direction={sortDirection === SortingOption.Desc ? 'bottom' : 'top'}
                  selected={sortingType === CardListingsSortingType.Price}
                  filled
                />
              </TYPE.medium>
            </td>

            <td>
              <TYPE.medium
                onClick={() => toggleSort(CardListingsSortingType.SerialNumber)}
                style={{ cursor: 'pointer' }}
              >
                <Trans>Serial</Trans>
                <StyledCaret
                  direction={sortDirection === SortingOption.Desc ? 'bottom' : 'top'}
                  selected={sortingType === CardListingsSortingType.SerialNumber}
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
          <InfiniteScroll
            next={loadMore}
            hasMore={hasNext ?? false}
            dataLength={cardListings?.length ?? 0}
            loader={hasNext && <PaginationSpinner loading />}
          >
            {listingsComponents}
          </InfiniteScroll>
        </tbody>
      </StyledTable>
    </StyledOffersSelector>
  )
}
