import { useCallback, useMemo, useState, useEffect } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
import { useRouter } from 'next/router'

import Section from '@/components/Section'
import { BackButton } from '@/components/Button'
import Column from '@/components/Column'
import Card from '@/components/Card'
import CardModelBreakdown from '@/components/CardModelBreakdown'
import CardOwnership from '@/components/CardOwnership'
import CardTransfersHistory from '@/components/CardsTransfersHistory/card'
import YoutubeEmbed from '@/components/YoutubeEmbed'
import CardModel3D from '@/components/CardModel3D'
import useCardsBackPictureUrl from '@/hooks/useCardsBackPictureUrl'
import GiftModal from '@/components/GiftModal'
import CreateOfferModal from '@/components/MarketplaceModal/CreateOffer'
import CancelOfferModal from '@/components/MarketplaceModal/CancelOffer'
import AcceptOfferModal from '@/components/MarketplaceModal/AcceptOffer'
import { useSearchOffers } from '@/state/search/hooks'
import useCardsPendingStatus, { CardPendingStatus } from '@/hooks/useCardsPendingStatus'
import { useSearchCardModels } from '@/state/search/hooks'
import { PaginationSpinner } from '@/components/Spinner'

const MainSection = styled(Section)`
  position: relative;
  display: flex;
  flex-direction: row-reverse;
  margin-bottom: 96px;

  ${({ theme }) => theme.media.small`
    flex-direction: column;
    align-items: center;
    gap: 12px;
    max-width: 500px;
    margin-bottom: 64px;
  `}
`

const MainSectionCardsWrapper = styled(Column)`
  gap: 24px;
  width: 350px;
  z-index: 1; /* firefox... */

  & > div:last-child {
    min-height: 215px;
  }

  ${({ theme }) => theme.media.small`
    gap: 16px;
    width: 100%;
  `}
`

const CardTransfersHistoryWrapper = styled(Card)`
  ${({ theme }) => theme.media.extraSmall`
    display: none;
  `}
`

const QUERY_CARD = gql`
  query ($slug: String!) {
    card(slug: $slug) {
      id
      serialNumber
      inTransfer
      inOfferCreation
      inOfferCancelation
      inOfferAcceptance
      owner {
        user {
          slug
          username
          profile {
            pictureUrl(derivative: "width=128")
            fallbackUrl(derivative: "width=128")
          }
        }
      }
      cardModel {
        id
        slug
        videoUrl
        pictureUrl(derivative: "width=1024")
        season
        youtubePreviewId
        averageSale
        artist {
          displayName
          user {
            username
          }
        }
        scarcity {
          name
          maxSupply
        }
      }
    }
  }
`

export default function CardBreakout() {
  const router = useRouter()
  const { cardModelSlug, serialNumber } = router.query
  const cardSlug = `${cardModelSlug}-${serialNumber}`

  // hits
  const [cardModelHit, setCardModelHit] = useState<any | null>(null)

  // card query
  const cardQuery = useQuery(QUERY_CARD, { variables: { slug: cardSlug }, skip: !cardSlug })
  const card = cardQuery.data?.card

  // card's back
  const backPictureUrl = useCardsBackPictureUrl(512)

  // pending status
  const [pendingStatus, setPendingStatus] = useState<CardPendingStatus | null>(null)
  const pendingsStatus = useCardsPendingStatus([card])
  useEffect(() => setPendingStatus(pendingsStatus[0] ?? null), [pendingsStatus[0]])

  // actions callbacks
  const onSuccessfulGift = useCallback(() => setPendingStatus(CardPendingStatus.IN_TRANSFER), [])
  const onSuccessfulOfferCreation = useCallback(() => setPendingStatus(CardPendingStatus.IN_OFFER_CREATION), [])
  const onSuccessfulOfferCancelation = useCallback(() => setPendingStatus(CardPendingStatus.IN_OFFER_CANCELATION), [])
  const onSuccessfulOfferAcceptance = useCallback(() => setPendingStatus(CardPendingStatus.IN_OFFER_ACCEPTANCE), [])

  // card price
  const offerSearch = useSearchOffers({ facets: { cardId: card?.id }, skip: !card?.id, hitsPerPage: 1 })
  const cardPrice = useMemo(
    () => (offerSearch?.hits?.[0]?.price ? `0x${offerSearch?.hits?.[0]?.price}` : null),
    [offerSearch?.hits?.[0]?.price]
  )

  // card model search
  const onPageFetched = useCallback((hits) => setCardModelHit(hits[0] ?? null), [])
  const cardModelSearch = useSearchCardModels({
    facets: { cardModelId: card?.cardModel?.id },
    skip: !card?.cardModel?.id,
    onPageFetched,
  })

  // loading
  const isLoading = cardModelSearch.loading || cardQuery.loading

  return (
    <>
      <Section marginTop="32px">
        <BackButton onClick={router.back} />
      </Section>

      {card && cardModelHit && (
        <>
          <MainSection size="sm">
            <CardModel3D
              videoUrl={card.cardModel.videoUrl}
              pictureUrl={card.cardModel.pictureUrl}
              backPictureUrl={backPictureUrl}
              scarcityName={card.cardModel.scarcity.name}
            />
            <MainSectionCardsWrapper>
              <Card>
                <CardModelBreakdown
                  artistName={card.cardModel.artist.displayName}
                  artistUsername={card.cardModel.artist.user?.username}
                  season={card.cardModel.season}
                  scarcityName={card.cardModel.scarcity.name}
                  maxSupply={card.cardModel.scarcity.maxSupply}
                  serial={card.serialNumber}
                  slug={card.cardModel.slug}
                />
              </Card>
              <div>
                {card.owner && (
                  <Card>
                    <CardOwnership
                      ownerSlug={card.owner.user.slug}
                      ownerUsername={card.owner.user.username}
                      ownerProfilePictureUrl={card.owner.user.profile.pictureUrl}
                      ownerProfileFallbackUrl={card.owner.user.profile.fallbackUrl}
                      pendingStatus={pendingStatus ?? undefined}
                      price={cardPrice ?? undefined}
                    />
                  </Card>
                )}
              </div>
            </MainSectionCardsWrapper>
          </MainSection>

          <Section size="sm">
            <Column gap={64}>
              <CardTransfersHistoryWrapper>
                <CardTransfersHistory cardModelId={card.cardModel.id} serialNumber={card.serialNumber} />
              </CardTransfersHistoryWrapper>
              <YoutubeEmbed embedId={card.cardModel.youtubePreviewId} style={{ minWidth: '100%' }} />
            </Column>
          </Section>

          <GiftModal
            artistName={card.cardModel.artist.displayName}
            scarcityName={card.cardModel.scarcity.name}
            scarcityMaxSupply={card.cardModel.scarcity.maxSupply}
            season={card.cardModel.season}
            serialNumber={card.serialNumber}
            pictureUrl={card.cardModel.pictureUrl}
            onSuccess={onSuccessfulGift}
          />

          <CreateOfferModal
            artistName={card.cardModel.artist.displayName}
            scarcityName={card.cardModel.scarcity.name}
            scarcityMaxSupply={card.cardModel.scarcity.maxSupply}
            lowestAsk={cardModelHit.lowestAsk}
            averageSale={card.cardModel.averageSale}
            season={card.cardModel.season}
            serialNumber={card.serialNumber}
            pictureUrl={card.cardModel.pictureUrl}
            onSuccess={onSuccessfulOfferCreation}
          />

          {cardPrice && (
            <>
              <CancelOfferModal
                artistName={card.cardModel.artist.displayName}
                scarcityName={card.cardModel.scarcity.name}
                scarcityMaxSupply={card.cardModel.scarcity.maxSupply}
                season={card.cardModel.season}
                serialNumber={card.serialNumber}
                pictureUrl={card.cardModel.pictureUrl}
                onSuccess={onSuccessfulOfferCancelation}
              />

              <AcceptOfferModal
                artistName={card.cardModel.artist.displayName}
                scarcityName={card.cardModel.scarcity.name}
                scarcityMaxSupply={card.cardModel.scarcity.maxSupply}
                season={card.cardModel.season}
                serialNumber={card.serialNumber}
                pictureUrl={card.cardModel.pictureUrl}
                price={cardPrice}
                onSuccess={onSuccessfulOfferAcceptance}
              />
            </>
          )}
        </>
      )}

      <PaginationSpinner loading={isLoading} />
    </>
  )
}
