import React, { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components/macro'
import { Plural, Trans } from '@lingui/macro'
import InfiniteScroll from 'react-infinite-scroll-component'
import { WeiAmount } from '@rulesorg/sdk-core'

import { TYPE } from 'src/styles/theme'
import { RowBetween } from 'src/components/Row'
import { useMarketplaceFilters } from 'src/state/search/hooks'
import Table from 'src/components/Table'
import Caret from 'src/components/Caret'
import { PaginationSpinner } from 'src/components/Spinner'
import { useCardListings } from 'src/graphql/data/CardListings'
import { CardListingsSortingType, SortingOption } from 'src/graphql/data/__generated__/types-and-hooks'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import Checkbox from '../Checkbox'
import Link from '../Link'

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

const CheckboxWrapper = styled.td`
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
    (selectedSortingType: CardListingsSortingType) => {
      // if sort is already selected, update its direction
      if (sortingType === selectedSortingType) {
        setSortDirection((direction) => {
          switch (direction) {
            case SortingOption.Asc:
              return SortingOption.Desc
            case SortingOption.Desc:
              return SortingOption.Asc
          }
        })
      } else {
        setSortingType(selectedSortingType)
      }
    },
    [sortingType]
  )

  const {
    data: cardListings,
    hasNext,
    loadMore,
    loading,
  } = useCardListings({
    sort: { type: sortingType, direction: sortDirection },
    filter: { cardModelId },
  })

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  const listingsComponents = useMemo(() => {
    if (!cardListings) return null

    return cardListings.map((cardListing) => {
      const card = cardListing.card
      const cardModel = cardListing.cardModel
      const offerer = cardListing.offerer
      const serialNumber = cardListing.card.serialNumber

      // parsed price
      const parsedPrice = WeiAmount.fromRawAmount(cardListing.price)
      const fiatPrice = weiAmountToEURValue(parsedPrice)

      return (
        <tr key={cardListing.orderSigningData.salt}>
          <CheckboxWrapper>
            <Checkbox
              value={selectedSerialNumbers.includes(card.serialNumber)}
              onChange={() => toggleSelection(serialNumber, cardListing.price)}
            />
          </CheckboxWrapper>
          <td onClick={() => toggleSelection(serialNumber, cardListing.price)}>
            <Price>
              <TYPE.body fontWeight={700}>{`${+parsedPrice.toFixed(6)} ETH`}</TYPE.body>
              <TYPE.body color="text2">{fiatPrice ? `${fiatPrice} €` : '-'}</TYPE.body>
            </Price>
          </td>
          <td>
            <Link href={`/card/${cardModel.slug}/${serialNumber}`}>
              <TYPE.body color={serialNumber <= scarcityMaxLowSerial ? 'lowSerial' : undefined} clickable>
                #{serialNumber}
              </TYPE.body>
            </Link>
          </td>
          <td>
            {offerer.profile.username && (
              <Link href={`/user/${offerer.profile.slug}`}>
                <TYPE.body clickable>{offerer.profile.username}</TYPE.body>
              </Link>
            )}
          </td>
        </tr>
      )
    })
  }, [cardListings, weiAmountToEURValue, toggleSelection, selectedSerialNumbers, scarcityMaxLowSerial])

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

      {loading ? (
        <PaginationSpinner loading />
      ) : (
        <InfiniteScroll
          next={loadMore}
          hasMore={hasNext ?? false}
          dataLength={cardListings?.length ?? 0}
          loader={hasNext && <PaginationSpinner loading />}
        >
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

            <tbody>{listingsComponents}</tbody>
          </StyledTable>
        </InfiniteScroll>
      )}
    </StyledOffersSelector>
  )
}
