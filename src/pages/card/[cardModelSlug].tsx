import { useMemo } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
import { useRouter } from 'next/router'
import { WeiAmount } from '@rulesorg/sdk-core'

import Section from '@/components/Section'
import { BackButton } from '@/components/Button'
import Row, { RowReverse } from '@/components/Row'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import CardModelBreakdown from '@/components/CardModelBreakdown'
import CardModelSales from '@/components/CardModelSales'
import CardModelTransfersHistory from '@/components/CardsTransfersHistory/cardModel'
import YoutubeEmbed from '@/components/YoutubeEmbed'
import CardModelVideo from '@/components/CardModelVideo'
import { useEtherEURPrice } from '@/hooks/useFiatPrice'

const PageBody = styled(Column)`
  flex-grow: 1;
`

const QUERY_CARD_MODEL = gql`
  query ($slug: String!) {
    cardModel(slug: $slug) {
      id
      pictureUrl(derivative: "width=512")
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
      <Section size="sm">
        <Row gap={42}>
          <Column gap={12}>
            <div style={{ width: '32px', height: '32px', background: '#212121' }} />
            <div style={{ width: '32px', height: '32px', background: '#212121' }} />
            <div style={{ width: '32px', height: '32px', background: '#212121' }} />
          </Column>
          <PageBody gap={64}>
            <RowReverse style={{ position: 'relative' }}>
              <CardModelVideo src={cardModel.videoUrl} shadowImageSrc={cardModel.pictureUrl} />
              <Column gap={24}>
                <CardModelBreakdown
                  artistName={cardModel.artist.displayName}
                  artistUsername={cardModel.artist.user.username}
                  artistUserSlug={cardModel.artist.user.slug}
                  season={cardModel.season}
                  scarcity={cardModel.scarcity.name}
                  maxSupply={cardModel.scarcity.maxSupply}
                />
                <CardModelSales
                  slug={`${cardModelSlug}`}
                  lowestAskEUR={cardModel.lowestAskEUR}
                  averageSellEUR={cardModel.averageSellEUR}
                  cardsOnSaleCount={cardModel.cardsOnSaleCount}
                />
              </Column>
            </RowReverse>
            <CardModelTransfersHistory cardModelId={cardModel.id} style={{ marginTop: '32px' }} />
            <YoutubeEmbed embedId={cardModel.youtubePreviewId} style={{ minWidth: '100%' }} />
          </PageBody>
        </Row>
      </Section>
    </>
  )
}
