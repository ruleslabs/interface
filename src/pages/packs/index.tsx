import { useMemo } from 'react'
import { useQuery, gql } from '@apollo/client'

import Row from '@/components/Row'
import { RowBetween } from '@/components/Row'
import Section from '@/components/Section'
import YoutubeEmbed from '@/components/YoutubeEmbed'
import { TYPE } from '@/styles/theme'
import Column from '@/components/Column'
import Card from '@/components/Card'
import PackCard from '@/components/PackCard'
import { PackCountdownWrapper } from '@/components/PackWrapper'
import { useSearchPacks } from '@/state/search/hooks'

const QUERY_PACKS = gql`
  query ($ids: [ID!]!) {
    packsByIds(ids: $ids) {
      pictureUrl(derivative: "width=320")
      slug
      maxSupply
      supply
      releaseDate
    }
  }
`

export default function Packs() {
  const { hits: packsHits, loading: packsHitsLoading, error: packsHitsError } = useSearchPacks()

  const packsIds = useMemo(
    () =>
      (packsHits ?? []).reduce<string[]>((acc, hit: any) => {
        acc.push(hit.objectID)

        return acc
      }, []),
    [packsHits]
  )

  const {
    data: packsData,
    loading: packsLoading,
    error: packsError,
  } = useQuery(QUERY_PACKS, { variables: { ids: packsIds }, skip: !packsIds.length })

  const packs = packsData?.packsByIds ?? []
  const isValid = !packsHitsError && !packsError
  const isLoading = packsHitsLoading || packsLoading

  return (
    <>
      <Section marginBottom="100px" marginTop="44px">
        <Row gap={80} alignItems="end">
          {!isValid ? (
            <TYPE.body textAlign="center">An error has occured</TYPE.body>
          ) : isLoading ? (
            <TYPE.body textAlign="center">Loading...</TYPE.body>
          ) : (
            packs.map((pack: any, index: number) => (
              <PackCountdownWrapper key={`pack-card-${index}`} releaseDate={new Date(pack.releaseDate)}>
                <PackCard
                  slug={pack.slug}
                  pictureUrl={pack.pictureUrl}
                  soldout={pack.maxSupply ? pack.supply >= pack.maxSupply : false}
                  width={185}
                />
              </PackCountdownWrapper>
            ))
          )}
        </Row>
      </Section>
      <Section>
        <RowBetween gap={32}>
          <YoutubeEmbed embedId="EB9dyqYIH-A" style={{ minWidth: '700px' }} />
          <Card>
            <Column gap={32}>
              <Column gap={16}>
                <TYPE.body fontWeight={700}>Qu’est-ce qu’un pack ?</TYPE.body>
                <TYPE.body>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
                </TYPE.body>
              </Column>
              <Column gap={16}>
                <TYPE.body fontWeight={700}>Qu’est-ce qu’un pack ?</TYPE.body>
                <TYPE.body>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
                </TYPE.body>
              </Column>
              <Column gap={16}>
                <TYPE.body fontWeight={700}>Qu’est-ce qu’un pack ?</TYPE.body>
                <TYPE.body>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
                </TYPE.body>
              </Column>
            </Column>
          </Card>
        </RowBetween>
      </Section>
    </>
  )
}
