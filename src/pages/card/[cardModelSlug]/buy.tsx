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
    flex-direction: column;
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
      pictureUrl(derivative: "width=128")
      season
      scarcity {
        name
      }
      cardsOnSaleCount
      artist {
        displayName
      }
    }
  }
`

export default function BuyRule() {
  const router = useRouter()
  const { cardModelSlug } = router.query

  const [selectedOffer, setSelectedOffer] = useState<any | null>(null)
  const selectOffer = useCallback((offer: any | null) => setSelectedOffer(offer), [setSelectedOffer])

  const {
    data: cardModelData,
    loading: cardModelLoading,
    error: cardModelError,
  } = useQuery(QUERY_CARD_MODEL, { variables: { slug: cardModelSlug }, skip: !cardModelSlug })

  const cardModel = cardModelData?.cardModel

  const isValid = !cardModelError
  const isLoading = cardModelLoading

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
              cardsOnSaleCount={cardModel.cardsOnSaleCount}
              selectedOffer={selectedOffer}
              selectOffer={selectOffer}
            />
            <OffersSelectorBreakdownCard>
              <OffersSelectorBreakdown
                artistName={cardModel.artist?.displayName}
                season={cardModel.season}
                scarcity={cardModel.scarcity?.name}
                pictureUrl={cardModel.pictureUrl}
                priceEUR={selectedOffer?.priceEUR}
              />
            </OffersSelectorBreakdownCard>
          </>
        )}
      </MainSection>
    </>
  )
}
