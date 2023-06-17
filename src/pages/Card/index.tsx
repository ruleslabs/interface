import { useMemo } from 'react'
import styled from 'styled-components/macro'
import { gql, useQuery } from '@apollo/client'
import { useNavigate, useParams } from 'react-router-dom'

import Section from 'src/components/Section'
import { BackButton } from 'src/components/Button'
import Column from 'src/components/Column'
import Card from 'src/components/Card'
import CardModelBreakdown from 'src/components/CardModelBreakdown'
import CardOwnership from 'src/components/CardOwnership'
import CardTransfersHistory from 'src/components/CardsTransfersHistory/card'
import YoutubeEmbed from 'src/components/YoutubeEmbed'
import CardModel3D from 'src/components/CardModel3D'
import useCardsBackPictureUrl from 'src/hooks/useCardsBackPictureUrl'
import GiftModal from 'src/components/GiftModal'
import CreateOfferModal from 'src/components/MarketplaceModal/CreateOffer'
import CancelOfferModal from 'src/components/MarketplaceModal/CancelOffer'
import AcceptOfferModal from 'src/components/MarketplaceModal/AcceptOffer'
import { PaginationSpinner } from 'src/components/Spinner'
import DefaultLayout from 'src/components/Layout'
import * as Text from 'src/theme/components/Text'

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

const CARD_QUERY = gql`
  query ($cardSlug: String!) {
    card(slug: $cardSlug) {
      id
      serialNumber
      tokenId
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
        artistName
        scarcity {
          name
          maxSupply
          id
        }
      }
      listing {
        price
      }
    }
  }
`

function CardPage() {
  // query
  const { cardModelSlug, serialNumber } = useParams()
  const cardSlug = useMemo(() => `${cardModelSlug}-${serialNumber}`, [cardModelSlug, serialNumber])

  // nav
  const navigate = useNavigate()

  // query cards data
  const { data, loading, error } = useQuery(CARD_QUERY, { variables: { cardSlug }, skip: !cardSlug })
  const card = data?.card

  // card's back
  const backPictureUrl = useCardsBackPictureUrl(512)

  if (error) {
    return <Text.Body>{error}</Text.Body>
  }

  return (
    <>
      <Section marginTop="32px">
        <BackButton onClick={() => navigate(-1)} />
      </Section>

      {card && (
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
                  artistName={card.cardModel.artistName}
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
                    <CardOwnership owner={card.owner.user} tokenId={card.tokenId} price={card.listing?.price} />
                  </Card>
                )}
              </div>
            </MainSectionCardsWrapper>
          </MainSection>

          <Section size="sm">
            <Column gap={64}>
              <CardTransfersHistoryWrapper>
                <CardTransfersHistory tokenId={card.tokenId} />
              </CardTransfersHistoryWrapper>
              <YoutubeEmbed embedId={card.cardModel.youtubePreviewId} style={{ minWidth: '100%' }} />
            </Column>
          </Section>

          <GiftModal tokenIds={[card.tokenId]} />

          <CreateOfferModal tokenIds={[card.tokenId]} />

          {card.listing && (
            <>
              <CancelOfferModal
                artistName={card.cardModel.artistName}
                scarcityName={card.cardModel.scarcity.name}
                scarcityId={card.cardModel.scarcity.id}
                season={card.cardModel.season}
                serialNumber={card.serialNumber}
                pictureUrl={card.cardModel.pictureUrl}
              />

              <AcceptOfferModal tokenIds={[card.tokenId]} price={card.listing.price} />
            </>
          )}
        </>
      )}

      <PaginationSpinner loading={loading} />
    </>
  )
}

CardPage.withLayout = () => (
  <DefaultLayout>
    <CardPage />
  </DefaultLayout>
)

export default CardPage
