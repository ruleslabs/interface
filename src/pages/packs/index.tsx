import { useEffect, useState } from 'react'
import { useQuery, gql } from '@apollo/client'
import styled from 'styled-components'

import { useCurrentUser } from '@/state/user/hooks'
import Section from '@/components/Section'
import YoutubeEmbed from '@/components/YoutubeEmbed'
import { TYPE } from '@/styles/theme'
import Column from '@/components/Column'
import Card from '@/components/Card'
import PackCard from '@/components/PackCard'
import { PackCountdownWrapper } from '@/components/PackWrapper'

const PACKS_COUNT = 4

const PACK_CONTENT = `
  pictureUrl(derivative: "width=320")
  slug
  maxSupply
  supply
  releaseDate
`

const CLASSIC_PACKS_QUERY = gql`
  query {
    allClassicPacks(first: ${PACKS_COUNT}) {
      nodes { ${PACK_CONTENT} }
    }
  }
`

const LAST_STARTER_PACK_QUERY = gql`
  query {
    lastStarterPack { ${PACK_CONTENT} }
  }
`

const PacksWrapper = styled(Section)`
  display: grid;
  align-items: end;
  padding: 0 32px;
  margin: 44px auto 80px;
  grid-template-columns: repeat(${PACKS_COUNT}, 1fr);

  ${({ theme }) => theme.media.small`
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: center;
    padding: 0 16px;
  `}
`

const SecondarySection = styled(Section)`
  display: flex;
  gap: 32px;

  ${({ theme }) => theme.media.medium`
    flex-direction: column;
  `}
`

const StyledYoutubeEmbed = styled(YoutubeEmbed)`
  flex: 2;

  ${({ theme }) => theme.media.small`
    width: 100%;
  `}
`

const PacksInfosCard = styled(Card)`
  flex: 1;
`

export default function Packs() {
  const currentUser = useCurrentUser()

  const classicPacksQuery = useQuery(CLASSIC_PACKS_QUERY)
  const lastStarterPackQuery = useQuery(LAST_STARTER_PACK_QUERY)

  const [packs, setPacks] = useState([])

  useEffect(() => {
    let classicPacks = classicPacksQuery.data?.allClassicPacks?.nodes
    const starterPack = lastStarterPackQuery.data?.lastStarterPack

    if (!classicPacks || !starterPack) return
    if (currentUser?.boughtStarterPack ?? true) {
      setPacks(classicPacks)
      return
    }

    classicPacks = [...classicPacks]
    let index = 0

    for (const l = classicPacks.length; index < l; ++index) {
      if (+new Date(classicPacks[index].releaseDate) - +new Date() <= 0) break
    }
    classicPacks.splice(index, 0, starterPack)

    setPacks(classicPacks.slice(0, PACKS_COUNT))
  }, [
    classicPacksQuery.data?.allClassicPacks?.nodes,
    lastStarterPackQuery.data?.lastStarterPack,
    currentUser?.boughtStarterPack,
    setPacks,
  ])

  const isValid = !classicPacksQuery.error && !lastStarterPackQuery.error
  const isLoading = classicPacksQuery.loading || lastStarterPackQuery.loading

  return (
    <>
      <PacksWrapper>
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
      </PacksWrapper>
      <SecondarySection>
        <StyledYoutubeEmbed embedId="EB9dyqYIH-A" />
        <PacksInfosCard>
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
        </PacksInfosCard>
      </SecondarySection>
    </>
  )
}
