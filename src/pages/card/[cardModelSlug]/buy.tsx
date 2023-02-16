import { useState, useCallback } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
import { useRouter } from 'next/router'

import Section from '@/components/Section'
import { BackButton } from '@/components/Button'
import OffersSelectorBreakdown from '@/components/OffersSelectorBreakdown'
import OffersSelector from '@/components/OffersSelector'
import Card from '@/components/Card'

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
  width: 350px;
  height: fit-content;

  ${({ theme }) => theme.media.small`
    width: 100%;
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
        maxSupply
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
  const [selectedOffer, setSelectedOffer] = useState<{ id: string; serialNumber: number } | null>(null)
  const onSelection = useCallback(
    (offerId: string, serialNumber: number) => setSelectedOffer({ id: offerId, serialNumber }),
    []
  )

  // query
  const cardModelQuery = useQuery(QUERY_CARD_MODEL, { variables: { slug: cardModelSlug }, skip: !cardModelSlug })

  const cardModel = cardModelQuery?.data?.cardModel

  // on successful offer acceptance
  const [acceptedOfferIds, setAcceptedOfferIds] = useState<string[]>([])
  const onSuccessfulOfferAcceptance = useCallback(() => {
    if (selectedOffer?.id) setAcceptedOfferIds([...acceptedOfferIds, selectedOffer.id])
    setSelectedOffer(null)
  }, [acceptedOfferIds, selectedOffer?.id])

  const isValid = !cardModelQuery.error
  const isLoading = cardModelQuery.loading

  return (
    <>
      <Section marginTop="32px">
        <BackButton onClick={router.back} />
      </Section>

      <MainSection>
        {isValid && !isLoading && cardModel && (
          <>
            <StyledOffersSelector
              cardModelId={cardModel.id}
              acceptedOfferIds={acceptedOfferIds}
              selectedOfferId={selectedOffer?.id}
              onSelection={onSelection}
              scarcityMaxLowSerial={cardModel.scarcity.maxLowSerial}
            />
            <OffersSelectorBreakdownCard>
              <OffersSelectorBreakdown
                artistName={cardModel.artist.displayName}
                season={cardModel.season}
                scarcityName={cardModel.scarcity.name}
                scarcityMaxSupply={cardModel.scarcity.maxSupply}
                pictureUrl={cardModel.pictureUrl}
                serialNumber={selectedOffer?.serialNumber}
                offerId={selectedOffer?.id}
                onSuccessfulOfferAcceptance={onSuccessfulOfferAcceptance}
              />
            </OffersSelectorBreakdownCard>
          </>
        )}
      </MainSection>
    </>
  )
}
