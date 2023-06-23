import { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components/macro'
import { constants } from '@rulesorg/sdk-core'

import { SecondaryButton } from 'src/components/Button'
import DefaultLayout from 'src/components/Layout'
import ProfileLayout from 'src/components/Layout/Profile'
import Section from 'src/components/Section'
import Grid from 'src/components/Grid'
import { RowCenter } from 'src/components/Row'
import Column from 'src/components/Column'
import { TYPE } from 'src/styles/theme'
import Badges from 'src/components/Badges'
import useSearchedUser from 'src/hooks/useSearchedUser'
import useTrans from 'src/hooks/useTrans'
import Link from 'src/components/Link'
import Image from 'src/theme/components/Image'
import * as Text from 'src/theme/components/Text'
import { useRuledex } from 'src/graphql/data/ruledex'
import { PaginationSpinner } from 'src/components/Spinner'
import * as styles from './Ruledex.css'
import { Row } from 'src/theme/components/Flex'
import Box from 'src/theme/components/Box'

const ScarcitySelectorWrapper = styled(Row)`
  gap: 42px;
  flex-wrap: wrap;
  width: 100%;

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

const RuledexCardModel = styled(Column)<{ owned?: boolean }>`
  gap: 12px;
  position: relative;

  ${({ theme, owned = false }) =>
    !owned &&
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

function UserRuledex() {
  const [selectedSeason, setSelectedSeason] = useState(constants.CURRENT_SEASON)
  const [selectedScarcity, setSelectedScarcity] = useState<number | null>(null)

  // trans
  const trans = useTrans()

  // searched user
  const [user] = useSearchedUser()

  // Query rulédex
  const { data, loading, error } = useRuledex(selectedSeason, user?.slug)
  const ruledexCardModels = data?.user?.ruledex?.ruledexCardModels ?? []
  const ruledexScarcities = data?.user?.ruledex?.ruledexScarcities ?? []

  // selected scarcity
  const toggleSelectedScarcity = useCallback(
    (scarcityName: number) => setSelectedScarcity(selectedScarcity === scarcityName ? null : scarcityName),
    [selectedScarcity]
  )

  const isScarcitySelected = useCallback(
    (scarcityId) => selectedScarcity === null || scarcityId === selectedScarcity,
    [selectedScarcity]
  )

  // select season
  const selectSeason = useCallback((season: number) => {
    setSelectedSeason(season)
    setSelectedScarcity(null)
  }, [])

  // components
  const scarcitiesComponents = useMemo(
    () =>
      ruledexScarcities.map(({ balance, maxBalance, scarcityId }) => {
        const scarcity = constants.Seasons[selectedSeason][scarcityId]

        return (
          <ScarcitySelector key={scarcity.name} active={isScarcitySelected(scarcityId)} scarcity={scarcity.name}>
            <RowCenter onClick={() => toggleSelectedScarcity(scarcityId)}>
              <TYPE.body fontWeight={700}>{trans('scarcity', scarcity.name)}</TYPE.body>

              <TYPE.large spanColor="text2" fontSize={32}>
                {balance} <span>/{maxBalance}</span>
              </TYPE.large>
            </RowCenter>
          </ScarcitySelector>
        )
      }),
    [ruledexScarcities, selectedSeason, toggleSelectedScarcity, isScarcitySelected]
  )

  if (error) {
    return <Text.Body>{JSON.stringify(error)}</Text.Body>
  }

  return (
    <Section marginTop="32px">
      {loading ? (
        <PaginationSpinner loading />
      ) : (
        <>
          <Box className={styles.actionsContainer}>
            <ScarcitySelectorWrapper>{scarcitiesComponents}</ScarcitySelectorWrapper>

            <Row className={styles.seasonsContainer}>
              {Object.keys(constants.Seasons).map((season) => (
                <Text.HeadlineMedium
                  key={season}
                  className={styles.seasonButton({ active: selectedSeason === +season })}
                  onClick={() => selectSeason(+season)}
                >
                  S{season}
                </Text.HeadlineMedium>
              ))}
            </Row>
          </Box>

          <StyledGrid gap={28} maxWidth={132}>
            {ruledexCardModels
              .filter(({ cardModel }) => selectedScarcity === null || cardModel.scarcity.id === selectedScarcity)
              .map(({ cardModel, owned, badges }) => (
                <RuledexCardModel key={cardModel.slug} owned={owned}>
                  <Link href={`/card/${cardModel.slug}`}>
                    <Image src={cardModel.pictureUrl} display={'block'} width={'full'} />
                  </Link>

                  <Badges badges={badges} />

                  <CardModelId>#{cardModel.uid.toString().padStart(3, '0')}</CardModelId>
                </RuledexCardModel>
              ))}
          </StyledGrid>
        </>
      )}
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
