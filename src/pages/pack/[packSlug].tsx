import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { useQuery, gql } from '@apollo/client'

import Section from '@/components/Section'
import { BackButton } from '@/components/Button'
import PackBreakdown from '@/components/PackBreakdown'
import { TYPE } from '@/styles/theme'
import Row from '@/components/Row'
import Column from '@/components/Column'
import Card from '@/components/Card'
import CardModel from '@/components/CardModel'
import Grid from '@/components/Grid'
import { PackPosterWrapper } from '@/components/PackWrapper'

const QUERY_PACK = gql`
  query ($slug: String!) {
    pack(slug: $slug) {
      id
      availableQuantity
      displayName
      price
      cardsPerPack
      pictureUrl(derivative: "width=256")
      releaseDate
      maxSupply
      supply
      cardModels {
        cardModel {
          slug
          pictureUrl(derivative: "width=512")
          season
        }
      }
    }
  }
`

export default function Pack() {
  const router = useRouter()
  const { packSlug } = router.query

  const {
    data: packData,
    loading: packLoading,
    error: packError,
  } = useQuery(QUERY_PACK, { variables: { slug: packSlug }, skip: !packSlug })

  // get seasons from pack cardModels
  const seasons = useMemo(() => {
    const seasons = ((packData?.pack?.cardModels ?? []) as any[]).reduce<number[]>(
      (acc, { cardModel }: { cardModel: any }) => {
        if (!acc.includes(cardModel.season)) acc.push(cardModel.season)
        return acc
      },
      []
    )

    return seasons.sort()
  }, [packData?.pack?.cardModels])

  const pack = packData?.pack
  const isValid = !packError
  const isLoading = packLoading || !pack

  return (
    <>
      <Section marginTop="44px">
        <BackButton onClick={router.back} />
      </Section>
      {!isValid ? (
        <TYPE.body textAlign="center">An error has occured</TYPE.body>
      ) : isLoading ? (
        <TYPE.body textAlign="center">Loading...</TYPE.body>
      ) : (
        <>
          <Section marginBottom="84px">
            <Row gap={52}>
              <PackPosterWrapper>
                <img src={pack.pictureUrl} width="185px" />
              </PackPosterWrapper>
              <Column gap={32}>
                <PackBreakdown
                  name={pack.displayName}
                  id={pack.id}
                  price={pack.price}
                  cardsPerPack={pack.cardsPerPack}
                  seasons={seasons}
                  releaseDate={new Date(pack.releaseDate)}
                  availableSupply={pack.maxSupply ? pack.maxSupply - pack.supply : undefined}
                  availableQuantity={pack.availableQuantity}
                />
                <Card width="350px">
                  <Column gap={32}>
                    <TYPE.body>Les cartes de ce pack sont créées en étroite collaboration avec les artistes.</TYPE.body>
                    <TYPE.body>50% des revenus leur sont reversés directement.</TYPE.body>
                    <TYPE.body>
                      Chaque carte donne accès à un channel Discord spécifique et à des airdrops de cadeaux tout au long
                      de l’année.
                    </TYPE.body>
                  </Column>
                </Card>
              </Column>
            </Row>
          </Section>
          <Section>
            <TYPE.body fontWeight={700} style={{ marginBottom: '42px' }}>
              Selection de cartes possibles
            </TYPE.body>
            <Grid gap={44}>
              {(pack.cardModels ?? []).map(({ cardModel }: { cardModel: any }, index: number) => (
                <CardModel
                  key={`pack-rules-${index}`}
                  cardModelSlug={cardModel.slug}
                  pictureUrl={cardModel.pictureUrl}
                />
              ))}
            </Grid>
          </Section>
        </>
      )}
    </>
  )
}
