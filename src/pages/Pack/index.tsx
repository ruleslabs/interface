import { useCallback, useEffect, useMemo, useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { useNavigate, useParams } from 'react-router-dom'

import Section from 'src/components/Section'
import { BackButton } from 'src/components/Button'
import PackBreakdown from 'src/components/PackBreakdown'
import { TYPE } from 'src/styles/theme'
import Row from 'src/components/Row'
import Column from 'src/components/Column'
import Card from 'src/components/Card'
import { PackPosterWrapper } from 'src/components/PackWrapper'
import DefaultLayout from 'src/components/Layout'
import Image from 'src/theme/components/Image'
import CollectionNfts from 'src/components/nft/Collection/CollectionNfts'
import { NftCard } from 'src/components/nft/Card'
import { PaginationSpinner } from 'src/components/Spinner'

const StyledMainSection = styled(Section)`
  margin-bottom: 84px;

  ${({ theme }) => theme.media.medium`
    margin-bottom: 48px;
  `}
`

const CardModelsSelectionTitle = styled(TYPE.body)`
  font-weight: 700;
  margin-bottom: 42px;

  ${({ theme }) => theme.media.medium`
    margin-bottom: 20px;
  `}
`

const CardsColumn = styled(Column)`
  min-width: 350px;
  width: 350px;
  gap: 32px;
  margin: 0 auto;

  ${({ theme }) => theme.media.medium`
    min-width: auto;
    width: 100%;
    max-width: 500px;
    gap: 24px;
  `}
`

const ExplanationsCard = styled(Card)`
  br {
    display: block;
    margin-top: 32px;
    content: '';
  }
`

const PACK_QUERY = gql`
  query ($packSlug: String!) {
    pack(slug: $packSlug) {
      id
      availableQuantity
      displayName
      description
      price
      cardsPerPack
      pictureUrl(derivative: "width=512")
      supply
      season
      soldout
      cardModelsOverview {
        slug
        pictureUrl(derivative: "width=512")
        videoUrl
        scarcity {
          name
        }
        artistName
      }
      ... on QuantityLimitedPack {
        releaseDate
      }
      ... on TimeLimitedPack {
        releaseDate
      }
    }
  }
`

function Pack() {
  // query
  const { packSlug } = useParams()

  // nav
  const navigate = useNavigate()

  const { data, loading, error } = useQuery(PACK_QUERY, { variables: { packSlug }, skip: !packSlug })
  const pack = data?.pack

  // purchase
  const [availableQuantity, setAvailableQuantity] = useState(0)
  useEffect(() => setAvailableQuantity(pack?.availableQuantity ?? 0), [pack?.availableQuantity])

  const onSuccessfulPackPurchase = useCallback(
    (boughtQuantity: number) => setAvailableQuantity(availableQuantity - boughtQuantity),
    [setAvailableQuantity, availableQuantity]
  )

  // assets
  const cardModels = pack?.cardModelsOverview ?? []
  const assets = useMemo(
    () =>
      cardModels.map((cardModel: any) => (
        <NftCard
          key={cardModel.slug}
          asset={{
            animationUrl: cardModel.videoUrl,
            imageUrl: cardModel.pictureUrl,
            tokenId: cardModel.slug,
            scarcity: cardModel.scarcity.name,
          }}
          display={{
            href: `/card/${cardModel.slug}`,
            primaryInfo: cardModel.artistName,
          }}
        />
      )),
    [cardModels.length]
  )

  if (error) {
    return (
      <TYPE.body textAlign="center">
        <Trans>An error has occured</Trans>
      </TYPE.body>
    )
  }

  return (
    <>
      <Section marginTop="36px">
        <BackButton onClick={() => navigate(-1)} />
      </Section>

      <StyledMainSection>
        {pack ? (
          <Row gap={52} switchDirection="medium">
            <PackPosterWrapper>
              <Image src={pack.pictureUrl} zIndex={'1'} width={'256'} />
            </PackPosterWrapper>
            <CardsColumn>
              <Card>
                <PackBreakdown
                  name={pack.displayName}
                  id={pack.id}
                  price={pack.price}
                  cardsPerPack={pack.cardsPerPack}
                  season={pack.season}
                  soldout={pack.soldout}
                  releaseDate={pack.releaseDate ? new Date(pack.releaseDate) : undefined}
                  availableQuantity={availableQuantity}
                  onSuccessfulPackPurchase={onSuccessfulPackPurchase}
                />
              </Card>
              <ExplanationsCard>
                <Column gap={28}>
                  <TYPE.body>
                    <strong>
                      <Trans id={pack.description}>{pack.description}</Trans>
                    </strong>
                  </TYPE.body>
                  <TYPE.body>
                    <Trans>Cards of this pack are created by working closely with the artists.</Trans>
                  </TYPE.body>
                  <TYPE.body>
                    <Trans>50% of revenues will be distributed to them directly.</Trans>
                  </TYPE.body>
                  <TYPE.body>
                    <Trans>
                      Each card gives access to specific Discord channel and to airdrops of gifts during the year.
                    </Trans>
                  </TYPE.body>
                </Column>
              </ExplanationsCard>
            </CardsColumn>
          </Row>
        ) : (
          <PaginationSpinner loading={loading} />
        )}
      </StyledMainSection>

      <Section>
        <CardModelsSelectionTitle>
          <Trans>Example of possible cards</Trans>
        </CardModelsSelectionTitle>

        <CollectionNfts hasNext={loading} dataLength={cardModels.length ?? 0}>
          {assets}
        </CollectionNfts>
      </Section>
    </>
  )
}

Pack.withLayout = () => (
  <DefaultLayout>
    <Pack />
  </DefaultLayout>
)

export default Pack
