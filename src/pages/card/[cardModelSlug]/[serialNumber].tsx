import { useMemo } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
import { useRouter } from 'next/router'
import { WeiAmount } from '@rulesorg/sdk-core'

import Section from '@/components/Section'
import { BackButton } from '@/components/Button'
import Row, { RowBetween } from '@/components/Row'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import CardModelBreakdown from '@/components/CardModelBreakdown'
import CardOwnership from '@/components/CardOwnership'
import CardTransfersHistory from '@/components/CardsTransfersHistory/card'
import YoutubeEmbed from '@/components/YoutubeEmbed'
import CardModelVideo from '@/components/CardModelVideo'
import { useEtherEURPrice } from '@/hooks/useFiatPrice'

const PageBody = styled(Column)`
  flex-grow: 1;
`

const QUERY_CARD = gql`
  query ($slug: String!) {
    card(slug: $slug) {
      serialNumber
      currentOffer {
        ask
      }
      owner {
        user {
          slug
          username
          profile {
            pictureUrl(derivative: "width=128")
          }
        }
      }
      cardModel {
        id
        videoUrl
        season
        youtubePreviewId
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

export default function RuleBreakout() {
  const router = useRouter()
  const { cardModelSlug, serialNumber } = router.query
  const cardSlug = `${cardModelSlug}-${serialNumber}`

  const etherEURprice = useEtherEURPrice()

  const { data: cardData, loading, error } = useQuery(QUERY_CARD, { variables: { slug: cardSlug }, skip: !cardSlug })

  const card = useMemo(
    () =>
      etherEURprice && cardData?.card && cardData?.card.currentOffer?.ask
        ? {
            ...cardData.card,
            askEur: WeiAmount.fromRawAmount(cardData.card.currentOffer.ask)
              .multiply(Math.round(etherEURprice))
              .toFixed(2),
          }
        : cardData?.card,
    [cardData?.card, etherEURprice]
  )

  if (!!error || !!loading) {
    if (!!error) console.error(error)
    return null
  }

  if (!card) {
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
            <RowBetween>
              <CardModelVideo src={card.cardModel.videoUrl} />
              <Column gap={24}>
                <CardModelBreakdown
                  artistName={card.cardModel.artist.displayName}
                  artistUsername={card.cardModel.artist.user.username}
                  artistUserSlug={card.cardModel.artist.user.slug}
                  season={card.cardModel.season}
                  scarcity={card.cardModel.scarcity.name}
                  maxSupply={card.cardModel.scarcity.maxSupply}
                  serial={card.serialNumber}
                />
                <CardOwnership
                  ownerSlug={card.owner.user.slug}
                  ownerUsername={card.owner.user.username}
                  ownerProfilePictureUrl={card.owner.user.profile.pictureUrl}
                  askEur={card.askEur}
                />
              </Column>
            </RowBetween>
            <CardTransfersHistory
              cardModelId={card.cardModel.id}
              serialNumber={card.serialNumber}
              style={{ marginTop: '32px' }}
            />
            <YoutubeEmbed embedId={card.cardModel.youtubePreviewId} style={{ minWidth: '100%' }} />
          </PageBody>
        </Row>
      </Section>
    </>
  )
}
