import { useMemo } from 'react'
import { gql, useQuery } from '@apollo/client'
import styled from 'styled-components'
import { Plural, Trans } from '@lingui/macro'

import Column, { ColumnCenter } from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { RowCenter } from '@/components/Row'
import { SecondaryButton, PrimaryButton } from '@/components/Button'
import { PaginationSpinner } from '@/components/Spinner'

const StyledLiveRewardRow = styled(ColumnCenter)<{ claimed?: boolean; closed: boolean }>`
  width: 100%;
  gap: 16px;
  justify-content: space-between;
  background: ${({ theme }) => theme.bg3}40;
  border: 1px solid ${({ theme, claimed = false }) => (claimed ? theme.primary1 : `${theme.bg3}80`)};
  border-radius: 5px;
  overflow: hidden;
  background: ${({ theme }) => theme.black};

  ${({ closed }) => closed && 'opacity: 0.3;'}

  ${({ theme, claimed = false }) => claimed && `box-shadow: 0 0 16px 10px ${theme.primary1}40;`}

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

  & > * {
    min-width: 150px;
    height: 40px;
  }

  ${({ theme }) => theme.media.extraSmall`
    gap: 16px;
  `}
`

const ClaimButton = styled(SecondaryButton)`
  background: ${({ theme }) => theme.text1};
  color: ${({ theme }) => theme.bg1};
`

const StyledProgressBar = styled.div<{ value: number }>`
  width: 100%;
  height: 5px;
  position: relative;
  background-color: ${({ theme }) => theme.black};
  background-image: ${({ theme, value }) =>
    `linear-gradient(to right, ${theme.primary1} 0, ${theme.primary1} ${value}%, transparent ${value}%)`};
  margin-top: 32px;

  & > * {
  }
`

const ProgressBarText = styled(TYPE.body)<{ position: 'left' | 'right' }>`
  position: absolute;
  ${({ position }) => position}: 8px;
  top: -28px;
  font-family: Inconsolata, monospace;
  background: ${({ theme }) => theme.bg3}80;
  font-size: 14px;
  padding: 2px 4px;
  border-radius: 2px;
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
      claimed
    }
  }
`

interface ProgressBarProps {
  value: number
  leftText?: string
  rightText?: string
}

const ProgressBar = ({ value, leftText, rightText }: ProgressBarProps) => {
  return (
    <StyledProgressBar value={value}>
      {!!leftText && <ProgressBarText position="left">{leftText}</ProgressBarText>}
      {!!rightText && <ProgressBarText position="right">{rightText}</ProgressBarText>}
    </StyledProgressBar>
  )
}

interface LiveRewardRowProps {
  liveReward: {
    pictureUrl: string
    totalSlotsCount: number
    claimedSlotsCount: number
    claimed?: boolean
    eligible?: boolean
  }
}

const LiveRewardRow = ({ liveReward }: LiveRewardRowProps) => {
  const closed = useMemo(
    () => liveReward.claimedSlotsCount >= liveReward.totalSlotsCount,
    [liveReward.claimedSlotsCount, liveReward.totalSlotsCount]
  )

  const statusText = useMemo(() => {
    if (closed) return 'Ended'
    if (liveReward.claimed) return 'Claimed'
    if (!liveReward.eligible) return 'Not eligible'
    return
  }, [closed, liveReward.eligible, liveReward.claimed])

  return (
    <StyledLiveRewardRow claimed={liveReward.claimed} closed={closed}>
      <img src={liveReward.pictureUrl} />

      <LiveRewardButtonsWrapper>
        <PrimaryButton disabled={!liveReward.eligible || !!liveReward.claimed}>
          <Trans>Claim</Trans>
        </PrimaryButton>

        <SecondaryButton>
          <Trans>See more</Trans>
        </SecondaryButton>
      </LiveRewardButtonsWrapper>

      <ProgressBar
        value={(liveReward.claimedSlotsCount / liveReward.totalSlotsCount) * 100}
        leftText={`${liveReward.claimedSlotsCount} / ${liveReward.totalSlotsCount}`}
        rightText={statusText}
      />
    </StyledLiveRewardRow>
  )
}

export default function LiveRewards() {
  const allLiveRewardsQuery = useQuery(GET_ALL_LIVE_EVENTS)
  const liveRewards: any[] = allLiveRewardsQuery.data?.allLiveRewards ?? []

  const openEligibilityCount = useMemo(
    () =>
      liveRewards.reduce<number>(
        (acc, liveReward) =>
          acc + (liveReward.totalSlotsCount > liveReward.claimedSlotsCount && liveReward.eligible ? 1 : 0),
        0
      ),
    [liveRewards.length]
  )

  const isLoading = allLiveRewardsQuery.loading

  return (
    <Column gap={24}>
      {!isLoading && (
        <>
          <TYPE.body>
            {openEligibilityCount ? (
              <Trans>
                You are eligible to
                <span> </span>
                <Plural value={openEligibilityCount} _1="a live reward" other="{openEligibilityCount} live rewards" />!
              </Trans>
            ) : (
              <Trans>No open live rewards you&apos;re eligible to.</Trans>
            )}
          </TYPE.body>

          <Column gap={16}>
            {liveRewards.map((liveReward, index) => (
              <LiveRewardRow key={index} liveReward={liveReward} />
            ))}
          </Column>
        </>
      )}

      <PaginationSpinner loading={isLoading} />
    </Column>
  )
}
