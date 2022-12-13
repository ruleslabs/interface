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
import { useSearchCards } from '@/state/search/hooks'
import { TYPE } from '@/styles/theme'
import { useCurrentUser } from '@/state/user/hooks'
import { LOW_SERIAL_MAXS } from '@/constants/misc'

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
  border-radius: 3px;
`

const LowSerialBadge = styled.div`
  width: 36px;
  height: 36px;
  background: radial-gradient(circle, #44dd53 0, #1d8c28 100%);
  border-radius: 100%;
  position: absolute;
  top: -16px;
  right: -16px;

  ::after {
    content: '#';
    position: absolute;
    font-size: 26px;
    top: 3px;
    left: 10px;
    font-weight: 700;
    color: #fff;
  }
`

const QUERY_CARD_MODELS = gql`
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

const QUERY_CARDS = gql`
  query ($ids: [ID!]!) {
    cardsByIds(ids: $ids) {
      serialNumber
      cardModel {
        uid
        pictureUrl(derivative: "width=1024")
        season
        scarcity {
          name
        }
        artist {
          displayName
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

  // current user
  const currentUser = useCurrentUser()
  const isCurrentUserProfile = currentUser?.slug === userSlug

  // sort
  const [sortDesc, setSortDesc] = useState(true)
  const toggleSort = useCallback(() => setSortDesc(!sortDesc), [sortDesc])

  // get user's cards ids
  const cardsSearch = useSearchCards({ facets: { ownerStarknetAddress: address }, skip: !address })
  const cardIds = useMemo(() => (cardsSearch?.hits ?? []).map((hit: any) => hit.objectID, []), [cardsSearch?.hits])

  // Query cards
  const cardsQuery = useQuery(QUERY_CARDS, { variables: { ids: cardIds }, skip: !cardIds.length })
  const cards = cardsQuery.data?.cardsByIds ?? []

  // Query card models
  const allCardModelsQuery = useQuery(QUERY_CARD_MODELS)
  const cardModels = allCardModelsQuery.data?.allCardModels ?? []

  // unlocked card models
  const cardModelsBadges = useMemo(
    () =>
      (cards as any[]).reduce<{ [uid: number]: any }>((acc, card: any) => {
        acc[card.cardModel.uid] = acc[card.cardModel.uid] ?? {}

        if (card.serialNumber < LOW_SERIAL_MAXS[card.cardModel.scarcity.name] ?? 0)
          acc[card.cardModel.uid].lowSerial = true

        return acc
      }, {}),
    [cards.length]
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
      (cardModels as any[]).reduce<{ [scarcityName: string]: number }>((acc, cardModel: any) => {
        acc[cardModel.scarcity.name] = (acc[cardModel.scarcity.name] ?? 0) + 1
        return acc
      }, {}),
    [cardModels.length]
  )

  // scarcities balance
  const scarcitiesBalance = useMemo(
    () =>
      (cardModels as any[]).reduce<{ [scarcityName: string]: number }>((acc, cardModel: any) => {
        acc[cardModel.scarcity.name] = (acc[cardModel.scarcity.name] ?? 0) + (cardModelsBadges[cardModel.uid] ? 1 : 0)
        return acc
      }, {}),
    [cardModels.length, Object.keys(cardModelsBadges).length]
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
        {cardModels
          .filter((cardModel: any) => !selectedScarcity || cardModel.scarcity.name === selectedScarcity)
          .sort((a: any, b: any) => a.uid - b.uid)
          .map((cardModel: any) => (
            <LockableCardModel key={cardModel.slug} locked={!cardModelsBadges[cardModel.uid]}>
              <CardModel cardModelSlug={cardModel.slug} pictureUrl={cardModel.pictureUrl} />
              <CardModelId>#{cardModel.uid.toString().padStart(3, '0')}</CardModelId>
              {cardModelsBadges[cardModel.uid]?.lowSerial && <LowSerialBadge />}
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
