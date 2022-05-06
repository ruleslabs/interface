import { useMemo, useCallback, useState } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
import { useRouter } from 'next/router'
import { WeiAmount } from '@rulesorg/sdk-core'

import Section from '@/components/Section'
import { BackButton } from '@/components/Button'
import Column from '@/components/Column'
import Card from '@/components/Card'
import { TYPE } from '@/styles/theme'
import CardModelBreakdown from '@/components/CardModelBreakdown'
import CardOwnership from '@/components/CardOwnership'
import CardTransfersHistory from '@/components/CardsTransfersHistory/card'
import YoutubeEmbed from '@/components/YoutubeEmbed'
import CardModelVideo from '@/components/CardModelVideo'
import CardModelPicture from '@/components/CardModelPicture'
import { useEtherEURPrice } from '@/hooks/useFiatPrice'
import CardDisplaySelector from '@/components/CardDisplaySelector'

const StyledCardDisplaySelector = styled(CardDisplaySelector)`
  position: absolute;
  top: 0;
  left: -64px;

  ${({ theme }) => theme.media.small`
    position: initial;
    flex-direction: row;
    margin-bottom: 12px;
  `}

  ${({ theme }) => theme.media.medium`
    left: 16px;
  `}
`

const StyledCardModelVideo = styled(CardModelVideo)`
  left: 16px;

  ${({ theme }) => theme.media.small`
    position: initial;
    width: 100%;
  `}

  ${({ theme }) => theme.media.medium`
    left: 96px;
  `}
`

const StyledCardModelPicture = styled(CardModelPicture)`
  left: 16px;

  ${({ theme }) => theme.media.small`
    position: initial;
  `}

  ${({ theme }) => theme.media.medium`
    left: 96px;
  `}
`

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
        pictureUrl(derivative: "width=64")
        backPictureUrl(derivative: "width=512")
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

export default function CardBreakout() {
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

  const [cardModelDisplayMode, setCardModelDisplayMode] = useState<'front' | 'back' | 'spin'>('front')
  const onBackSelected = useCallback(() => setCardModelDisplayMode('back'), [setCardModelDisplayMode])
  const onFrontSelected = useCallback(() => setCardModelDisplayMode('front'), [setCardModelDisplayMode])

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

      <MainSection size="sm">
        <StyledCardModelVideo
          src={card.cardModel.videoUrl}
          style={{ display: cardModelDisplayMode === 'front' ? 'initial' : 'none' }}
        />
        <StyledCardModelPicture
          src={card.cardModel.backPictureUrl}
          style={{ display: cardModelDisplayMode === 'back' ? 'initial' : 'none' }}
        />
        <StyledCardDisplaySelector
          pictureUrl={card.cardModel.pictureUrl}
          backPictureUrl={card.cardModel.backPictureUrl}
          onBackSelected={onBackSelected}
          onFrontSelected={onFrontSelected}
        />
        <MainSectionCardsWrapper>
          <Card>
            <CardModelBreakdown
              artistName={card.cardModel.artist.displayName}
              artistUsername={card.cardModel.artist.user.username}
              artistUserSlug={card.cardModel.artist.user.slug}
              season={card.cardModel.season}
              scarcity={card.cardModel.scarcity.name}
              maxSupply={card.cardModel.scarcity.maxSupply}
              serial={card.serialNumber}
            />
          </Card>
          <Card>
            <CardOwnership
              ownerSlug={card.owner.user.slug}
              ownerUsername={card.owner.user.username}
              ownerProfilePictureUrl={card.owner.user.profile.pictureUrl}
              askEur={card.askEur}
            />
          </Card>
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
    </>
  )
}
