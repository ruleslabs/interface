import { useState, useCallback } from 'react'
import { useQuery, gql } from '@apollo/client'
import { useRouter } from 'next/router'

import Section from '@/components/Section'
import { BackButton } from '@/components/Button'
import Row from '@/components/Row'
import OffersSelectorBreakdown from '@/components/OffersSelectorBreakdown'
import OffersSelector from '@/components/OffersSelector'

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
      <Section>
        <Row justify="end" gap={64}>
          {isValid && !isLoading && cardModel && (
            <>
              <OffersSelector
                cardModelId={cardModel.id}
                cardsOnSaleCount={cardModel.cardsOnSaleCount}
                selectedOffer={selectedOffer}
                selectOffer={selectOffer}
              />
              <OffersSelectorBreakdown
                artistName={cardModel.artist?.displayName}
                season={cardModel.season}
                scarcity={cardModel.scarcity?.name}
                pictureUrl={cardModel.pictureUrl}
                price={selectedOffer?.price}
              />
            </>
          )}
        </Row>
      </Section>
    </>
  )
}
