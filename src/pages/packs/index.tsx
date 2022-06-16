import { useEffect, useState } from 'react'
import { useQuery, gql } from '@apollo/client'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { useCurrentUser } from '@/state/user/hooks'
import Section from '@/components/Section'
import YoutubeEmbed from '@/components/YoutubeEmbed'
import { TYPE } from '@/styles/theme'
import Column from '@/components/Column'
import Card from '@/components/Card'
import PackCard from '@/components/PackCard'
import { PackCountdownWrapper } from '@/components/PackWrapper'
import Link from '@/components/Link'

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
  grid-template-columns: repeat(${PACKS_COUNT}, auto);
  justify-content: space-between;

  & > * {
    margin: 0 auto;
  }

  ${({ theme }) => theme.media.medium`
    grid-template-columns: repeat(3, auto);

    & > *:nth-child(-n+3) {
      display: block;
    }

    & > * {
      display: none;
    }
  `}

  ${({ theme }) => theme.media.small`
    margin-bottom: 64px;
    grid-template-columns: auto;
    flex-direction: column;
    align-items: center;
    padding: 0 16px;
    justify-content: center;
    gap: 32px;

    & > *:nth-child(-n+3) {
      display: block;
    }

    & > * {
      display: none;
    }
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

    if (!classicPacks || !starterPack) {
      if (classicPacks) setPacks(classicPacks.slice(0, PACKS_COUNT))
      return
    }
    if (currentUser?.boughtStarterPack ?? true) {
      setPacks(classicPacks.slice(0, PACKS_COUNT))
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
          <TYPE.body textAlign="center">
            <Trans>An error has occured</Trans>
          </TYPE.body>
        ) : isLoading ? (
          <TYPE.body textAlign="center">Loading...</TYPE.body>
        ) : (
          packs.map((pack: any, index: number) => (
            <PackCountdownWrapper key={`pack-card-${index}`} releaseDate={new Date(pack.releaseDate)}>
              <PackCard
                slug={pack.slug}
                pictureUrl={pack.pictureUrl}
                soldout={pack.maxSupply ? pack.supply >= pack.maxSupply : false}
                width={200}
              />
            </PackCountdownWrapper>
          ))
        )}
      </PacksWrapper>
      <SecondarySection>
        <StyledYoutubeEmbed embedId="wyYopaStt60" />
        <PacksInfosCard>
          <Column gap={32}>
            <Column gap={16}>
              <TYPE.body fontWeight={700}>
                <Trans>Rules ?</Trans>
              </TYPE.body>
              <TYPE.body>
                <Trans>
                  Rules is a trading card game about rap music. All cards are official, crafted by our illustrators
                  team, and each purchase enables independent artists to thrive.
                </Trans>
              </TYPE.body>
            </Column>
            <Column gap={16}>
              <TYPE.body fontWeight={700}>
                <Trans>Where can I join the community ?</Trans>
              </TYPE.body>
              <TYPE.body>
                <Trans>
                  <Link href="https://discord.gg/DrfezKYUhH" target="_blank" underline>
                    Rules’ Discord
                  </Link>
                  <span>&nbsp;</span>
                  is where conversations and sharing between collectors happens.
                  <br />
                  By&nbsp;
                  <Link href="/settings/profile" target="_blank" underline>
                    connecting your account
                  </Link>
                  , you get access to specific channels linked to the cards you own.
                </Trans>
              </TYPE.body>
            </Column>
            <Column gap={16}>
              <TYPE.body fontWeight={700}>
                <Trans>Blockchain ?</Trans>
              </TYPE.body>
              <TYPE.body>
                <Trans>
                  Rules’ cards are secured on the&nbsp;
                  <Link href="https://starkware.co/starknet/" target="_blank" underline>
                    Starknet
                  </Link>
                  <span>&nbsp;</span>
                  blockchain. It’s a technology based on&nbsp;
                  <Link href="https://ethereum.org/en/" target="_blank" underline>
                    Ethereum
                  </Link>
                  , but that needs way less energy and ressources.
                </Trans>
              </TYPE.body>
            </Column>
          </Column>
        </PacksInfosCard>
      </SecondarySection>
    </>
  )
}
