import { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
import { useRouter } from 'next/router'
import { WeiAmount, Unit } from '@rulesorg/sdk-core'

import Section from '@/components/Section'
import { BackButton } from '@/components/Button'
import OffersSelectorBreakdown from '@/components/OffersSelectorBreakdown'
import OffersSelector from '@/components/OffersSelector'
import Card from '@/components/Card'
import { PaginationSpinner } from '@/components/Spinner'

const MainSection = styled(Section)`
  display: flex;
  gap: 64px;

  ${({ theme }) => theme.media.medium`
    gap: 32px;
  `}

  ${({ theme }) => theme.media.small`
    flex-direction: column-reverse;
    gap: 16px;
  `}
`

const OffersSelectorBreakdownCard = styled(Card)`
  position: sticky;
  width: 350px;
  height: fit-content;
  top: ${({ theme }) => theme.size.headerHeight + 16}px;

  ${({ theme }) => theme.media.small`
    width: 100%;
  `}

  ${({ theme }) => theme.media.medium`
    top: ${theme.size.headerHeightMedium + 16}px;
  `}
`

const StyledOffersSelector = styled(OffersSelector)`
  flex: 1;

  ${({ theme }) => theme.media.medium`
    padding: 32px 24px;
  `}

  ${({ theme }) => theme.media.small`
    padding: 32px 0;
  `}
`

const QUERY_CARD_MODEL = gql`
  query ($slug: String!) {
    cardModel(slug: $slug) {
      id
      pictureUrl(derivative: "width=256")
      season
      scarcity {
        name
        maxLowSerial
      }
      artist {
        displayName
      }
    }
  }
`

export default function Buy() {
  // router
  const router = useRouter()
  const { cardModelSlug } = router.query

  // offer selection
  const [selectedOffers, setSelectedOffers] = useState<Array<{ serialNumber: number; price: string }>>([])
  const selectedSerialNumbers = useMemo(
    () => selectedOffers.map(({ serialNumber }) => serialNumber),
    [selectedOffers.length]
  )

  // offer selection handler
  const toggleOfferSelection = useCallback(
    (serialNumber: number, price: string) => {
      if (selectedSerialNumbers.includes(serialNumber))
        setSelectedOffers(selectedOffers.filter((offer) => offer.serialNumber !== serialNumber))
      else setSelectedOffers(selectedOffers.concat({ serialNumber, price }))
    },
    [selectedOffers.length, selectedSerialNumbers.length]
  )

  // price
  const selectedOffersPriceTotal = useMemo(
    () =>
      selectedOffers
        .reduce<WeiAmount>((acc, { price }) => acc.add(WeiAmount.fromRawAmount(`0x${price}`)), WeiAmount.ZERO)
        .toUnitFixed(Unit.WEI),
    [selectedOffers.length]
  )

  // query
  const cardModelQuery = useQuery(QUERY_CARD_MODEL, { variables: { slug: cardModelSlug }, skip: !cardModelSlug })

  const cardModel = cardModelQuery?.data?.cardModel

  // on successful offer acceptance
  const [acceptedSerialNumbers] = useState<number[]>([])

  const isLoading = cardModelQuery.loading

  return (
    <>
      <Section marginTop="32px">
        <BackButton onClick={router.back} />
      </Section>

      <MainSection>
        {cardModel && (
          <>
            <StyledOffersSelector
              cardModelId={cardModel.id}
              acceptedSerialNumbers={acceptedSerialNumbers}
              selectedSerialNumbers={selectedSerialNumbers}
              toggleSelection={toggleOfferSelection}
              scarcityMaxLowSerial={cardModel.scarcity.maxLowSerial}
            />
            <OffersSelectorBreakdownCard>
              <OffersSelectorBreakdown
                artistName={cardModel.artist.displayName}
                season={cardModel.season}
                scarcityName={cardModel.scarcity.name}
                pictureUrl={cardModel.pictureUrl}
                serialNumbers={selectedSerialNumbers}
                price={selectedOffersPriceTotal}
              />
            </OffersSelectorBreakdownCard>
          </>
        )}

        <PaginationSpinner loading={isLoading} />
      </MainSection>
    </>
  )
}
