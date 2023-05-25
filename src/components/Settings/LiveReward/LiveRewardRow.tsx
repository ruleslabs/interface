import { useCallback, useMemo } from 'react'
import styled from 'styled-components/macro'
import { Trans, t } from '@lingui/macro'

import { ColumnCenter } from 'src/components/Column'
import { TYPE } from 'src/styles/theme'
import { RowCenter } from 'src/components/Row'
import { SecondaryButton, PrimaryButton } from 'src/components/Button'
import { LiveReward } from '.'
import { useLiveRewardDetailsModalToggle, useLiveRewardTicketModalToggle } from 'src/state/application/hooks'

const StyledLiveRewardRow = styled(ColumnCenter)<{ closed: boolean }>`
  width: 100%;
  gap: 16px;
  justify-content: space-between;
  background: ${({ theme }) => theme.bg3}40;
  border-radius: 5px;
  overflow: hidden;
  background: ${({ theme }) => theme.black};
  ${({ theme, closed }) =>
    closed
      ? `
        border: 1px solid ${theme.bg3}80;
        opacity: 0.3;
      `
      : `
        border: 1px solid ${theme.primary1};
        box-shadow: 0 0 16px 10px ${theme.primary1}40;
      `}

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

export interface LiveRewardRowProps {
  liveReward: LiveReward
  onSelected: (liveReward: LiveReward) => void
}

export default function LiveRewardRow({ liveReward, onSelected }: LiveRewardRowProps) {
  // modal
  const toggleLiveRewardDetailsModal = useLiveRewardDetailsModalToggle()
  const toggleLiveRewardTicketModal = useLiveRewardTicketModalToggle()

  const closed = useMemo(
    () => liveReward.claimedSlotsCount >= liveReward.totalSlotsCount,
    [liveReward.claimedSlotsCount, liveReward.totalSlotsCount]
  )

  const statusText = useMemo(() => {
    if (closed) return t`Ended`
    if (liveReward.claimed) return t`Claimed`
    if (!liveReward.eligible) return t`Not eligible`
    return
  }, [closed, liveReward.eligible, liveReward.claimed])

  // buttons handlers
  const onDetails = useCallback(() => {
    onSelected(liveReward)
    toggleLiveRewardDetailsModal()
  }, [onSelected, JSON.stringify(liveReward)])

  const onClaim = useCallback(() => {
    onSelected(liveReward)
    toggleLiveRewardTicketModal()
  }, [onSelected, JSON.stringify(liveReward)])

  return (
    <>
      <StyledLiveRewardRow closed={closed}>
        <img src={liveReward.pictureUrl} />

        <LiveRewardButtonsWrapper>
          <PrimaryButton onClick={onClaim} disabled={!liveReward.eligible || !!liveReward.claimed}>
            <Trans>Claim</Trans>
          </PrimaryButton>

          <SecondaryButton onClick={onDetails}>
            <Trans>See more</Trans>
          </SecondaryButton>
        </LiveRewardButtonsWrapper>

        <ProgressBar
          value={(liveReward.claimedSlotsCount / liveReward.totalSlotsCount) * 100}
          leftText={`${liveReward.claimedSlotsCount} / ${liveReward.totalSlotsCount}`}
          rightText={statusText}
        />
      </StyledLiveRewardRow>
    </>
  )
}
