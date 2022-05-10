import { useQuery, gql } from '@apollo/client'
import styled from 'styled-components'

import Section from '@/components/Section'
import YoutubeEmbed from '@/components/YoutubeEmbed'
import { TYPE } from '@/styles/theme'
import Column from '@/components/Column'
import Card from '@/components/Card'
import PackCard from '@/components/PackCard'
import { PackCountdownWrapper } from '@/components/PackWrapper'

const QUERY_ALL_AVAILABLE_PACKS = gql`
  query {
    allAvailablePacks {
      pictureUrl(derivative: "width=320")
      slug
      maxSupply
      supply
      releaseDate
    }
  }
`

const PacksWrapper = styled(Section)`
  display: flex;
  align-items: end;
  gap: 80px;
  padding: 0 32px;
  margin: 44px auto 80px;

  ${({ theme }) => theme.media.small`
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
  const { data: packsData, loading: packsLoading, error: packsError } = useQuery(QUERY_ALL_AVAILABLE_PACKS)

  const packs = packsData?.allAvailablePacks ?? []
  const isValid = !packsError
  const isLoading = packsLoading

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
