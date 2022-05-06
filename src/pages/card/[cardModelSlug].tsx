import { useMemo } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
import { useRouter } from 'next/router'
import { WeiAmount } from '@rulesorg/sdk-core'

import Section from '@/components/Section'
import { BackButton } from '@/components/Button'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import CardModelBreakdown from '@/components/CardModelBreakdown'
import CardModelSales from '@/components/CardModelSales'
import CardModelTransfersHistory from '@/components/CardsTransfersHistory/cardModel'
import YoutubeEmbed from '@/components/YoutubeEmbed'
import { useEtherEURPrice } from '@/hooks/useFiatPrice'
import CardModel3D from '@/components/CardModel3D'
import Card from '@/components/Card'

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
      pictureUrl(derivative: "width=64")
      backPictureUrl(derivative: "width=512")
      videoUrl
      lowestAsk
      averageSell
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

export default function CardModelPage() {
  const router = useRouter()
  const { cardModelSlug } = router.query

  const etherEURprice = useEtherEURPrice()

  const {
    data: cardModelData,
    loading,
    error,
  } = useQuery(QUERY_CARD_MODEL, { variables: { slug: cardModelSlug }, skip: !cardModelSlug })

  const cardModel = useMemo(
    () =>
      etherEURprice && cardModelData?.cardModel
        ? {
            ...cardModelData.cardModel,
            lowestAskEUR: WeiAmount.fromRawAmount(cardModelData.cardModel.lowestAsk ?? 0)
              .multiply(Math.round(etherEURprice))
              .toFixed(2),
            averageSellEUR: WeiAmount.fromRawAmount(cardModelData.cardModel.averageSell ?? 0)
              .multiply(Math.round(etherEURprice))
              .toFixed(2),
          }
        : cardModelData?.cardModel,
    [etherEURprice, cardModelData?.cardModel]
  )

  if (!!error || !!loading) {
    if (!!error) console.error(error)
    return null
  }

  if (!cardModel) {
    return <TYPE.body>Card not found</TYPE.body>
  }

  return (
    <>
      <Section marginTop="32px">
        <BackButton onClick={router.back} />
      </Section>

      <MainSection size="sm">
        <CardModel3D
          videoUrl={cardModel.videoUrl}
          pictureUrl={cardModel.pictureUrl}
          backPictureUrl={cardModel.backPictureUrl}
        />
        <MainSectionCardsWrapper>
          <Card>
            <CardModelBreakdown
              artistName={cardModel.artist.displayName}
              artistUsername={cardModel.artist.user.username}
              artistUserSlug={cardModel.artist.user.slug}
              season={cardModel.season}
              scarcity={cardModel.scarcity.name}
              maxSupply={cardModel.scarcity.maxSupply}
            />
          </Card>
          <Card>
            <CardModelSales
              slug={`${cardModelSlug}`}
              lowestAskEUR={cardModel.lowestAskEUR}
              averageSellEUR={cardModel.averageSellEUR}
              cardsOnSaleCount={cardModel.cardsOnSaleCount}
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
  )
}
