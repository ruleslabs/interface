import { useMemo } from 'react'
import { gql, useQuery } from '@apollo/client'
import styled from 'styled-components'
import { Plural, Trans } from '@lingui/macro'

import Column, { ColumnCenter } from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { RowCenter } from '@/components/Row'
import { SecondaryButton, PrimaryButton } from '@/components/Button'
import { PaginationSpinner } from '@/components/Spinner'

const StyledLiveRewardRow = styled(ColumnCenter)<{ claimed: boolean; closed: boolean }>`
  width: 100%;
  gap: 16px;
  justify-content: space-between;
  background: ${({ theme }) => theme.bg3}40;
  border: 1px solid ${({ theme, claimed }) => (claimed ? theme.primary1 : `${theme.bg3}80`)};
  border-radius: 5px;
  overflow: hidden;
  background: ${({ theme }) => theme.black};

  ${({ closed }) => closed && 'opacity: 0.3;'}

  ${({ theme, claimed }) => claimed && `box-shadow: 0 0 16px 10px ${theme.primary1}40;`}

  img {
    aspect-ratio: 3 / 1;
    object-fit: cover;
  }

  & > * {
    width: 100%;
  }
`

const LiveRewardButtonsWrapper = styled(RowCenter)`
  gap: 32px;
  width: fit-content;

  button {
    min-width: 150px;
  }

  ${({ theme }) => theme.media.extraSmall`
    gap: 16px;
  `}
`

const ClaimButton = styled(SecondaryButton)`
  background: ${({ theme }) => theme.text1};
  color: ${({ theme }) => theme.bg1};
`

const ProgressBar = styled.div<{ value: number }>`
  width: 100%;
  height: 5px;
  position: relative;
  background-color: ${({ theme }) => theme.black};
  background-image: ${({ theme, value }) =>
    `linear-gradient(to right, ${theme.primary1} 0, ${theme.primary1} ${value}%, transparent ${value}%)`};
  margin-top: 32px;

  & > * {
    position: absolute;
    left: 8px;
    top: -28px;
    font-family: Inconsolata, monospace;
    background: ${({ theme }) => theme.bg3}80;
    font-size: 14px;
    padding: 2px 4px;
    border-radius: 2px;
  }
`

const GET_ALL_LIVE_EVENTS = gql`
  query {
    allLiveRewards {
      pictureUrl(derivative: "width=1568")
      date
      location
      displayName
      totalSlotsCount
      claimedSlotsCount
      eligible
    }
  }
`

interface LiveRewardRowProps {
  liveReward: {
    pictureUrl: string
    totalSlotsCount: number
    claimedSlotsCount: number
    claimed: boolean
    eligible: boolean
  }
}

const LiveRewardRow = ({ liveReward }: LiveRewardRowProps) => {
  const closed = useMemo(
    () => liveReward.claimedSlotsCount >= liveReward.totalSlotsCount,
    [liveReward.claimedSlotsCount, liveReward.totalSlotsCount]
  )

  return (
    <StyledLiveRewardRow claimed={liveReward.claimed} closed={closed}>
      <img src={liveReward.pictureUrl} />

      <LiveRewardButtonsWrapper>
        <PrimaryButton>Claim</PrimaryButton>
        <SecondaryButton>Learn more</SecondaryButton>
      </LiveRewardButtonsWrapper>

      <ProgressBar value={(liveReward.claimedSlotsCount / liveReward.totalSlotsCount) * 100}>
        <TYPE.body>
          {liveReward.claimedSlotsCount} / {liveReward.totalSlotsCount}
        </TYPE.body>
      </ProgressBar>
    </StyledLiveRewardRow>
  )
}

export default function LiveRewards() {
  const allLiveEventsQuery = useQuery(GET_ALL_LIVE_EVENTS)
  const liveEvents: any[] = allLiveEventsQuery.data?.allLiveRewards ?? []

  const eligibilityCount = useMemo(
    () => liveEvents.reduce<number>((acc, liveEvent) => acc + (liveEvent.eligilbe ? 1 : 0), 0),
    [liveEvents.length]
  )

  const isLoading = allLiveEventsQuery.loading

  return (
    <Column gap={24}>
      {!isLoading && (
        <>
          <TYPE.body>
            {eligibilityCount ? (
              <Trans>
                You are eligible to
                <span> </span>
                <Plural value={eligibilityCount} _1="a live reward" other="{eligibilityCount} live rewards" />!
              </Trans>
            ) : (
              <Trans>No open live rewards you&apos;re eligible to.</Trans>
            )}
          </TYPE.body>

          <Column gap={16}>
            {liveEvents.map((liveReward, index) => (
              <LiveRewardRow key={index} liveReward={liveReward} />
            ))}
          </Column>
        </>
      )}

      <PaginationSpinner loading={isLoading} />
    </Column>
  )
}
