import { useCallback, useState } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
import { useRouter } from 'next/router'

import Section from '@/components/Section'
import { BackButton } from '@/components/Button'
import Column from '@/components/Column'
import Card from '@/components/Card'
import { TYPE } from '@/styles/theme'
import CardModelBreakdown from '@/components/CardModelBreakdown'
import CardOwnership from '@/components/CardOwnership'
import CardTransfersHistory from '@/components/CardsTransfersHistory/card'
import YoutubeEmbed from '@/components/YoutubeEmbed'
import CardModel3D from '@/components/CardModel3D'
import useCardsBackPictureUrl from '@/hooks/useCardsBackPictureUrl'
import GiftModal from '@/components/GiftModal'
import CreateOfferModal from '@/components/CreateOfferModal'

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
      serialNumber
      starknetTokenId
      inTransfer
      currentOffer {
        price
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
        rotatingVideoUrl
        pictureUrl(derivative: "width=128")
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

  const cardQuery = useQuery(QUERY_CARD, { variables: { slug: cardSlug }, skip: !cardSlug })
  const card = cardQuery.data?.card

  const backPictureUrl = useCardsBackPictureUrl(512)

  // offer callback
  const [inTransfer, setInTransfer] = useState(false)
  const onSuccessfulOffer = useCallback(() => setInTransfer(true), [])

  if (cardQuery.error || cardQuery.loading) {
    if (cardQuery.error) console.error(cardQuery.error)
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
        <CardModel3D
          videoUrl={card.cardModel.videoUrl}
          rotatingVideoUrl={card.cardModel.rotatingVideoUrl}
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
              scarcity={card.cardModel.scarcity.name}
              maxSupply={card.cardModel.scarcity.maxSupply}
              serial={card.serialNumber}
            />
          </Card>
          <div>
            {card.owner && (
              <Card>
                <CardOwnership
                  ownerSlug={card.owner.user.slug}
                  ownerUsername={card.owner.user.username}
                  ownerProfilePictureUrl={card.owner.user.profile.pictureUrl}
                  inTransfer={card.inTransfer || inTransfer}
                  price={card.currentOffer?.price}
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
        tokenId={card.starknetTokenId}
        onSuccess={onSuccessfulOffer}
      />

      <CreateOfferModal
        artistName={card.cardModel.artist.displayName}
        scarcityName={card.cardModel.scarcity.name}
        scarcityMaxSupply={card.cardModel.scarcity.maxSupply}
        season={card.cardModel.season}
        serialNumber={card.serialNumber}
        pictureUrl={card.cardModel.pictureUrl}
        tokenId={card.starknetTokenId}
        onSuccess={onSuccessfulOffer}
      />
    </>
  )
}
