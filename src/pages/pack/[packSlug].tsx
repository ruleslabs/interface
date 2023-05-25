import { useCallback, useEffect, useState } from 'react'
import { gql } from '@apollo/client'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { apolloClient } from 'src/graphql/data/apollo'
import { useNavigate } from 'react-router-dom'

import Section from 'src/components/Section'
import { BackButton } from 'src/components/Button'
import PackBreakdown from 'src/components/PackBreakdown'
import { TYPE } from 'src/styles/theme'
import Row from 'src/components/Row'
import Column from 'src/components/Column'
import Card from 'src/components/Card'
import CardModel from 'src/components/CardModel'
import Grid from 'src/components/Grid'
import { PackPosterWrapper } from 'src/components/PackWrapper'
import useCurrentUser from 'src/hooks/useCurrentUser'
import useLocationQuery from 'src/hooks/useLocationQuery'

const StyledMainSection = styled(Section)`
  margin-bottom: 84px;

  ${({ theme }) => theme.media.medium`
    margin-bottom: 48px;
  `}
`

const StyledGrid = styled(Grid)`
  ${({ theme }) => theme.media.extraSmall`
    grid-template-columns: repeat(2, 1fr);
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

const QUERY_PACK = gql`
  query ($slug: String!) {
    pack(slug: $slug) {
      id
      availableQuantity
      displayName
      description
      price
      cardsPerPack
      pictureUrl(derivative: "width=512")
      releaseDate
      maxBuyableSupply
      supply
      season
      seasons
      cardModelsOverview {
        cardModel {
          slug
          pictureUrl(derivative: "width=512")
          season
          artist {
            displayName
          }
        }
      }
    }
  }
`

export default function Pack() {
  // query
  const query = useLocationQuery()
  const packSlug = query.get('packSlug')

  // nav
  const navigate = useNavigate()

  // current user
  const { currentUser } = useCurrentUser()

  const [packQuery, setPackQuery] = useState<any>({})

  useEffect(() => {
    apolloClient
      ?.query({ query: QUERY_PACK, variables: { slug: packSlug } })
      ?.then((response) => {
        setPackQuery(response)
      })
      ?.catch((error) => {
        setPackQuery({ error })
      })
  }, [!!currentUser])

  const pack = packQuery.data?.pack
  const error = packQuery.error
  const isLoading = packQuery.loading || !pack

  // purchase
  const [availableQuantity, setAvailableQuantity] = useState(0)
  useEffect(() => setAvailableQuantity(pack?.availableQuantity ?? 0), [pack?.availableQuantity])

  const onSuccessfulPackPurchase = useCallback(
    (boughtQuantity: number) => setAvailableQuantity(availableQuantity - boughtQuantity),
    [setAvailableQuantity, availableQuantity]
  )

  return (
    <>
      <Section marginTop="36px">
        <BackButton onClick={() => navigate(-1)} />
      </Section>
      {error ? (
        <TYPE.body textAlign="center">
          <Trans>An error has occured</Trans>
        </TYPE.body>
      ) : isLoading ? (
        <TYPE.body textAlign="center">Loading...</TYPE.body>
      ) : (
        <>
          <StyledMainSection>
            <Row gap={52} switchDirection="medium">
              <PackPosterWrapper>
                <img src={pack.pictureUrl} width="256px" />
              </PackPosterWrapper>
              <CardsColumn>
                <Card>
                  <PackBreakdown
                    name={pack.displayName}
                    id={pack.id}
                    price={pack.price}
                    cardsPerPack={pack.cardsPerPack}
                    seasons={pack.seasons}
                    releaseDate={new Date(pack.releaseDate)}
                    availableSupply={pack.maxBuyableSupply ? pack.maxBuyableSupply - pack.supply : undefined}
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
          </StyledMainSection>

          <Section>
            <CardModelsSelectionTitle>
              <Trans>Example of possible cards</Trans>
            </CardModelsSelectionTitle>
            <StyledGrid gap={16}>
              {(pack.cardModelsOverview ?? []).map((packCardModel: any, index: number) => (
                <CardModel
                  key={`pack-rules-${index}`}
                  cardModelSlug={packCardModel.cardModel.slug}
                  pictureUrl={packCardModel.cardModel.pictureUrl}
                  artistName={packCardModel.cardModel.artist.displayName}
                  season={packCardModel.cardModel.season}
                />
              ))}
            </StyledGrid>
          </Section>
        </>
      )}
    </>
  )
}
