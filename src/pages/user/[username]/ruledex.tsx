import { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
import { useRouter } from 'next/router'
import { ScarcityName } from '@rulesorg/sdk-core'

import { BaseButton } from '@/components/Button'
import DefaultLayout from '@/components/Layout'
import ProfileLayout from '@/components/Layout/Profile'
import Section from '@/components/Section'
import Grid from '@/components/Grid'
import CardModel from '@/components/CardModel'
import Row, { RowCenter } from '@/components/Row'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { RULEDEX_LOW_SERIAL_MAXS, RULEDEX_CARDS_COUNT_LEVELS_MINS } from '@/constants/misc'

import RuledexBadgeLowSerial from '@/images/ruledex-badge-low-serial.svg'
import RuledexBadgeCardsCountLevel1 from '@/images/ruledex-badge-cards-count-level-1.svg'
import RuledexBadgeCardsCountLevel2 from '@/images/ruledex-badge-cards-count-level-2.svg'
import RuledexBadgeCardsCountLevel3 from '@/images/ruledex-badge-cards-count-level-3.svg'
import RuledexBadgeCardsCountLevel4 from '@/images/ruledex-badge-cards-count-level-4.svg'

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

const ScarcitySelector = styled(BaseButton)<{ scarcity: string; active: boolean }>`
  border: solid 4px ${({ theme, scarcity, active }) => (active ? `${(theme as any)[scarcity]}` : 'transparent')};
  box-sizing: content-box;
  width: 100%;
  max-width: 246px;
  background: transparent;
  padding: 0;

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

    video {
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
  border-radius: 3px;
`

const Badges = styled(Column)`
  gap: 16px;
  position: absolute;
  top: -16px;
  right: -16px;

  & > svg {
    border-radius: 50%;
    width: 36px;
    height: 36px;
    box-shadow: 0px 4px 4px #00000040;
  }
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
          }
        }
      }
    }
  }
`

interface RuledexProps {
  address: string
}

function Ruledex({ address }: RuledexProps) {
  // user slug
  const router = useRouter()
  const { username } = router.query
  const userSlug = typeof username === 'string' ? username.toLowerCase() : null

  // Query cards
  const ownedCardModelsQuery = useQuery(USER_OWNED_CARD_MODELS_QUERY, {
    variables: { slug: userSlug },
    skip: !userSlug,
  })
  const ownedCardModels = ownedCardModelsQuery.data?.user.ownedCardModels ?? []

  // Query card models
  const allCardModelsQuery = useQuery(ALL_CARD_MODELS_QUERY)
  const allCardModels = allCardModelsQuery.data?.allCardModels ?? []

  // owned card models
  const cardModelsBadges = useMemo(
    () =>
      (ownedCardModels as any[]).reduce<{ [uid: number]: any }>((acc, ownedCardModel) => {
        // skip if needed
        if (!ownedCardModel.serialNumbers.length) return acc

        // init badges
        acc[ownedCardModel.cardModel.uid] = acc[ownedCardModel.cardModel.uid] ?? { level: 0 }

        // low serial badge
        for (const serialNumber of ownedCardModel.serialNumbers) {
          if (serialNumber <= RULEDEX_LOW_SERIAL_MAXS[ownedCardModel.cardModel.scarcity.name]) {
            acc[ownedCardModel.cardModel.uid].lowSerial = true
            break
          }
        }

        // card counts badges
        for (const cardCountMin of RULEDEX_CARDS_COUNT_LEVELS_MINS) {
          if (ownedCardModel.serialNumbers.length >= cardCountMin) ++acc[ownedCardModel.cardModel.uid].level
        }

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
    <Section>
      <ScarcitySelectorWrapper>
        {ScarcityName.map((scarcityName) => (
          <ScarcitySelector
            key={scarcityName}
            active={selectedScarcity === scarcityName}
            scarcity={scarcityName.toLowerCase()}
          >
            <RowCenter onClick={() => toggleSelectedScarcity(scarcityName)}>
              <TYPE.body fontWeight={700}>{scarcityName}</TYPE.body>

              <TYPE.large spanColor="text2" fontSize={32}>
                {scarcitiesBalance[scarcityName] ?? 0} <span>/{scarcitiesMax[scarcityName] ?? 0}</span>
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
              <CardModel cardModelSlug={cardModel.slug} pictureUrl={cardModel.pictureUrl} />

              <CardModelId>#{cardModel.uid.toString().padStart(3, '0')}</CardModelId>

              <Badges>
                {cardModelsBadges[cardModel.uid]?.lowSerial && <RuledexBadgeLowSerial />}
                {cardModelsBadges[cardModel.uid]?.level === 1 && <RuledexBadgeCardsCountLevel1 />}
                {cardModelsBadges[cardModel.uid]?.level === 2 && <RuledexBadgeCardsCountLevel2 />}
                {cardModelsBadges[cardModel.uid]?.level === 3 && <RuledexBadgeCardsCountLevel3 />}
                {cardModelsBadges[cardModel.uid]?.level === 4 && <RuledexBadgeCardsCountLevel4 />}
              </Badges>
            </LockableCardModel>
          ))}
      </StyledGrid>
    </Section>
  )
}

Ruledex.getLayout = (page: JSX.Element) => {
  return (
    <DefaultLayout>
      <ProfileLayout>{page}</ProfileLayout>
    </DefaultLayout>
  )
}

export default Ruledex
