import { useState, useCallback } from 'react'
import styled from 'styled-components/macro'
import { useQuery, gql } from '@apollo/client'
import { useNavigate, useParams } from 'react-router-dom'

import Section from 'src/components/Section'
import { BackButton } from 'src/components/Button'
import Column from 'src/components/Column'
import CardModelBreakdown from 'src/components/CardModelBreakdown'
import CardModelSales from 'src/components/CardModelSales'
import CardModelTransfersHistory from 'src/components/CardsTransfersHistory/cardModel'
import YoutubeEmbed from 'src/components/YoutubeEmbed'
import CardModel3D from 'src/components/CardModel3D'
import Card from 'src/components/Card'
import useCardsBackPictureUrl from 'src/hooks/useCardsBackPictureUrl'
import { useSearchCardModels } from 'src/state/search/hooks'
import { PaginationSpinner } from 'src/components/Spinner'
import DefaultLayout from 'src/components/Layout'

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

const QUERY_CARD_MODEL = gql`
  query ($slug: String!) {
    cardModel(slug: $slug) {
      id
      slug
      pictureUrl(derivative: "width=1024")
      videoUrl
      averageSale
      youtubePreviewId
      season
      scarcity {
        name
        maxSupply
      }
      cardsOnSaleCount
      artist {
        displayName
        user {
          slug
          username
        }
      }
    }
  }
`

function CardModel() {
  // query
  const { cardModelSlug } = useParams()

  // nav
  const navigate = useNavigate()

  // hits
  const [cardModelHit, setCardModelHit] = useState<any | null>(null)

  // card model query
  const cardModelQuery = useQuery(QUERY_CARD_MODEL, { variables: { slug: cardModelSlug }, skip: !cardModelSlug })
  const cardModel = cardModelQuery?.data?.cardModel

  // card's back
  const backPictureUrl = useCardsBackPictureUrl(512)

  // card model search
  const onPageFetched = useCallback((hits) => setCardModelHit(hits[0] ?? null), [])
  const cardModelSearch = useSearchCardModels({
    facets: { cardModelId: cardModel?.id },
    skip: !cardModel?.id,
    onPageFetched,
  })

  // loading
  const isLoading = cardModelSearch.loading || cardModelQuery.loading

  return (
    <>
      <Section marginTop="32px">
        <BackButton onClick={() => navigate(-1)} />
      </Section>

      {cardModel && cardModelHit && (
        <>
          <MainSection size="sm">
            <CardModel3D
              videoUrl={cardModel.videoUrl}
              pictureUrl={cardModel.pictureUrl}
              backPictureUrl={backPictureUrl}
              scarcityName={cardModel.scarcity.name}
              stacked={true}
            />
            <MainSectionCardsWrapper>
              <Card>
                <CardModelBreakdown
                  artistName={cardModel.artist.displayName}
                  artistUsername={cardModel.artist.user?.username}
                  season={cardModel.season}
                  scarcityName={cardModel.scarcity.name}
                  maxSupply={cardModel.scarcity.maxSupply}
                  slug={cardModel.slug}
                />
              </Card>
              <Card>
                <CardModelSales
                  slug={`${cardModelSlug}`}
                  cardModelId={cardModel.id}
                  lowestAsk={cardModelHit.lowestAsk}
                  averageSale={cardModel.averageSale}
                />
              </Card>
            </MainSectionCardsWrapper>
          </MainSection>

          <Section size="sm">
            <Column gap={64}>
              <CardTransfersHistoryWrapper>
                <CardModelTransfersHistory cardModelId={cardModel.id} />
              </CardTransfersHistoryWrapper>
              <YoutubeEmbed embedId={cardModel.youtubePreviewId} style={{ minWidth: '100%' }} />
            </Column>
          </Section>
        </>
      )}

      <PaginationSpinner loading={isLoading} />
    </>
  )
}

CardModel.withLayout = () => (
  <DefaultLayout>
    <CardModel />
  </DefaultLayout>
)

export default CardModel
