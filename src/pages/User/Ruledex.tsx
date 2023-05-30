import { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components/macro'
import { useQuery, gql } from '@apollo/client'
import { constants } from '@rulesorg/sdk-core'

import { SecondaryButton } from 'src/components/Button'
import DefaultLayout from 'src/components/Layout'
import ProfileLayout from 'src/components/Layout/Profile'
import Section from 'src/components/Section'
import Grid from 'src/components/Grid'
import Row, { RowCenter } from 'src/components/Row'
import Column from 'src/components/Column'
import { TYPE } from 'src/styles/theme'
import { RULEDEX_CARDS_COUNT_LEVELS_MINS } from 'src/constants/misc'
import Badges from 'src/components/Badges'
import useSearchedUser from 'src/hooks/useSearchedUser'
import useTrans from 'src/hooks/useTrans'
import Link from 'src/components/Link'
import Image from 'src/theme/components/Image'
import { Badge } from 'src/types'

const ScarcitySelectorWrapper = styled(Row)`
  gap: 42px;
  flex-wrap: wrap;

  ${({ theme }) => theme.media.medium`
    justify-content: space-around;
  `}

  ${({ theme }) => theme.media.small`
    gap: 24px;
  `}
`

const ScarcitySelector = styled(SecondaryButton)<{ scarcity: string; active: boolean }>`
  border: solid 4px ${({ theme, scarcity, active }) => (active ? `${(theme as any)[scarcity]}` : 'transparent')};
  box-sizing: content-box;
  width: 100%;
  max-width: 246px;
  background: transparent;
  padding: 0;

  &:hover {
    background: transparent;
  }

  & > div {
    background: ${({ theme }) => theme.bg2};
    border-style: solid;
    border-color: ${({ theme, scarcity }) => (theme as any)[scarcity]};
    border-width: 0 0 0 16px;
    height: 55px;
    padding: 0 15px 0 20px;
    justify-content: space-between;
  }
`

const StyledGrid = styled(Grid)`
  margin-top: 64px;
`

const LockableCardModel = styled(Column)<{ locked?: boolean }>`
  gap: 12px;
  position: relative;

  ${({ theme, locked = false }) =>
    locked &&
    `
    * {
      color: ${theme.text2};
    }

    img {
      filter: grayscale(1);
      opacity: 0.3;
    }
  `}
`

const CardModelId = styled(TYPE.body)`
  font-weight: 700;
  width: 100%;
  padding: 6px;
  text-align: center;
  background: ${({ theme }) => theme.bg2};
  border-radius: 6px;
`

const ALL_CARD_MODELS_QUERY = gql`
  query {
    allCardModels {
      slug
      uid
      scarcity {
        name
      }
      pictureUrl(derivative: "width=512")
    }
  }
`

const USER_OWNED_CARD_MODELS_QUERY = gql`
  query ($slug: String!) {
    user(slug: $slug) {
      ownedCardModels {
        serialNumbers
        cardModel {
          uid
          scarcity {
            name
            maxLowSerial
          }
        }
      }
    }
  }
`

function UserRuledex() {
  // trans
  const trans = useTrans()

  // searched user
  const [user] = useSearchedUser()

  // Query cards
  const ownedCardModelsQuery = useQuery(USER_OWNED_CARD_MODELS_QUERY, {
    variables: { slug: user?.slug },
    skip: !user?.slug,
  })
  const ownedCardModels = ownedCardModelsQuery.data?.user.ownedCardModels ?? []

  // Query card models
  const allCardModelsQuery = useQuery(ALL_CARD_MODELS_QUERY)
  const allCardModels = allCardModelsQuery.data?.allCardModels ?? []

  // owned card models
  const cardModelsBadges = useMemo(
    () =>
      (ownedCardModels as any[]).reduce<{ [uid: number]: Badge[] }>((acc, ownedCardModel) => {
        // skip if needed
        if (!ownedCardModel.serialNumbers.length) return acc

        // init badges
        acc[ownedCardModel.cardModel.uid] = acc[ownedCardModel.cardModel.uid] ?? []

        // low serial badge
        for (const serialNumber of ownedCardModel.serialNumbers) {
          if (serialNumber <= ownedCardModel.cardModel.scarcity.maxLowSerial) {
            acc[ownedCardModel.cardModel.uid].push(Badge.LOW_SERIAL)
            break
          }
        }

        // card counts badges
        let level = 0
        for (const cardCountMin of RULEDEX_CARDS_COUNT_LEVELS_MINS) {
          if (ownedCardModel.serialNumbers.length >= cardCountMin) ++level
        }

        acc[ownedCardModel.cardModel.uid].push(Badge[`CARDS_COUNT_LEVEL_${level}` as keyof typeof Badge])

        return acc
      }, {}),
    [ownedCardModels.length]
  )

  // selected scarcity
  const [selectedScarcity, setSelectedScarcity] = useState<string | null>(null)
  const toggleSelectedScarcity = useCallback(
    (scarcityName: string) => setSelectedScarcity(selectedScarcity === scarcityName ? null : scarcityName),
    [selectedScarcity]
  )

  // scarcities max
  const scarcitiesMax = useMemo(
    () =>
      (allCardModels as any[]).reduce<{ [scarcityName: string]: number }>((acc, cardModel: any) => {
        acc[cardModel.scarcity.name] = (acc[cardModel.scarcity.name] ?? 0) + 1
        return acc
      }, {}),
    [allCardModels.length]
  )

  // scarcities balance
  const scarcitiesBalance = useMemo(
    () =>
      (allCardModels as any[]).reduce<{ [scarcityName: string]: number }>((acc, cardModel: any) => {
        acc[cardModel.scarcity.name] = (acc[cardModel.scarcity.name] ?? 0) + (cardModelsBadges[cardModel.uid] ? 1 : 0)
        return acc
      }, {}),
    [allCardModels.length, Object.keys(cardModelsBadges).length]
  )

  return (
    <Section marginTop="32px">
      <ScarcitySelectorWrapper>
        {constants.Seasons[1].map((scarcity) => (
          <ScarcitySelector key={scarcity.name} active={selectedScarcity === scarcity.name} scarcity={scarcity.name}>
            <RowCenter onClick={() => toggleSelectedScarcity(scarcity.name)}>
              <TYPE.body fontWeight={700}>{trans('scarcity', scarcity.name)}</TYPE.body>

              <TYPE.large spanColor="text2" fontSize={32}>
                {scarcitiesBalance[scarcity.name] ?? 0} <span>/{scarcitiesMax[scarcity.name] ?? 0}</span>
              </TYPE.large>
            </RowCenter>
          </ScarcitySelector>
        ))}
      </ScarcitySelectorWrapper>

      <StyledGrid gap={28} maxWidth={132}>
        {allCardModels
          .filter((cardModel: any) => !selectedScarcity || cardModel.scarcity.name === selectedScarcity)
          .sort((a: any, b: any) => a.uid - b.uid)
          .map((cardModel: any) => (
            <LockableCardModel key={cardModel.slug} locked={!cardModelsBadges[cardModel.uid]}>
              <Link href={`/card/${cardModel.slug}`}>
                <Image src={cardModel.pictureUrl} display={'block'} width={'full'} />
              </Link>

              <Badges badges={cardModelsBadges[cardModel.uid]} />

              <CardModelId>#{cardModel.uid.toString().padStart(3, '0')}</CardModelId>
            </LockableCardModel>
          ))}
      </StyledGrid>
    </Section>
  )
}

UserRuledex.withLayout = () => (
  <DefaultLayout>
    <ProfileLayout>
      <UserRuledex />
    </ProfileLayout>
  </DefaultLayout>
)

export default UserRuledex
