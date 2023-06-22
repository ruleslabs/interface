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

const CARD_MODEL_QUERY = gql`
  query ($cardModelSlug: String!) {
    cardModel(slug: $cardModelSlug) {
      id
      slug
      pictureUrl(derivative: "width=1024")
      videoUrl
      averageSale
      youtubePreviewId
      season
      listedCardsCount
      listedCardsCount
      artistName
      lowestAsk
      scarcity {
        name
        maxSupply
      }
    }
  }
`

function CardModel() {
  // query
  const { cardModelSlug } = useParams()

  // nav
  const navigate = useNavigate()

  // card model query
  const { data, loading, error } = useQuery(CARD_MODEL_QUERY, { variables: { cardModelSlug }, skip: !cardModelSlug })
  const cardModel = data?.cardModel

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

      {cardModel && (
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
                  artistName={cardModel.artistName}
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
                  lowestAsk={cardModel.lowestAsk}
                  averageSale={cardModel.averageSale}
                  listingsCount={cardModel.listedCardsCount}
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

      <PaginationSpinner loading={loading} />
    </>
  )
}

CardModel.withLayout = () => (
  <DefaultLayout>
    <CardModel />
  </DefaultLayout>
)

export default CardModel
