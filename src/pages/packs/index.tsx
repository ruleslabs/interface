import { useMemo } from 'react'
import { useQuery, gql } from '@apollo/client'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { useCurrentUser } from '@/state/user/hooks'
import Section from '@/components/Section'
import YoutubeEmbed from '@/components/YoutubeEmbed'
import { TYPE } from '@/styles/theme'
import Column from '@/components/Column'
import { RowCenter } from '@/components/Row'
import Card from '@/components/Card'
import PackCard from '@/components/PackCard'
import { PackCountdownWrapper } from '@/components/PackWrapper'
import Link from '@/components/Link'
import { SecondaryButton } from '@/components/Button'
import Caret from '@/components/Caret'

const PACKS_COUNT = 4

const PACK_CONTENT = `
  pictureUrl(derivative: "width=320")
  slug
  maxBuyableSupply
  supply
  releaseDate
`

const PACKS_QUERY = gql`
  query {
    allClassicPacks(first: ${PACKS_COUNT}) {
      nodes { ${PACK_CONTENT} }
    }
    lastStarterPack { ${PACK_CONTENT} }
  }
`

const PacksWrapper = styled(Section)`
  position: relative;
  display: grid;
  align-items: end;
  padding: 0 32px;
  margin: 44px auto 80px;
  grid-template-columns: repeat(${PACKS_COUNT}, 1fr);
  justify-content: space-between;

  & > * {
    margin: 0 auto;
  }

  ${({ theme }) => theme.media.medium`
    grid-template-columns: repeat(3, auto);

    & > div:nth-child(-n+3) {
      display: block;
    }

    & > div {
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
  `}
`

const SeeMyPacksLink = styled(Link)`
  position: absolute;
  right: 32px;
  top: 0;

  svg {
    width: 12px;
    height: 12px;
  }

  ${({ theme }) => theme.media.small`
    position: relative;
    right: unset;
    top: unset;
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

  const packsQuery = useQuery(PACKS_QUERY)

  const packs = useMemo(() => {
    if (!packsQuery.data) return []

    let classicPacks = packsQuery.data?.allClassicPacks?.nodes
    const starterPack = packsQuery.data?.lastStarterPack

    if (!classicPacks || !starterPack) return classicPacks?.slice(0, PACKS_COUNT) ?? []
    if (currentUser?.boughtStarterPack) return classicPacks.slice(0, PACKS_COUNT)

    classicPacks = [...classicPacks]
    let index = 0

    for (const l = classicPacks.length; index < l; ++index)
      if (+new Date(classicPacks[index].releaseDate) - +new Date() <= 0) break

    classicPacks.splice(index, 0, starterPack)

    return classicPacks.slice(0, PACKS_COUNT)
  }, [packsQuery.data, currentUser?.boughtStarterPack])

  const isValid = !packsQuery.error
  const isLoading = packsQuery.loading

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
                soldout={pack.maxBuyableSupply ? pack.supply >= pack.maxBuyableSupply : false}
                width={200}
                state="buyable"
              />
            </PackCountdownWrapper>
          ))
        )}
        {currentUser && (
          <SeeMyPacksLink href={`/user/${currentUser.slug}/packs`}>
            <SecondaryButton>
              <RowCenter gap={8}>
                <Trans>See my packs</Trans>
                <Caret direction="right" />
              </RowCenter>
            </SecondaryButton>
          </SeeMyPacksLink>
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
