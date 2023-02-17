import { useMemo } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import Row, { RowCenter } from '@/components/Row'
import { ColumnCenter } from '@/components/Column'
import { Certified, TopCollector } from './Badge'
import { useAvatarEditModalToggle } from '@/state/application/hooks'
import Avatar from '@/components/Avatar'
import { useCScoreTopCollector, useCScoreRank } from '@/hooks/useCScore'
import { TOP_COLLECTOR_RANK_MAX } from '@/constants/misc'

import Crown from '@/images/crown.svg'
import RankIcon from '@/images/rank.svg'

type Size = 'sm' | 'md' | 'lg'

const UserAvatarWrapper = styled.div<{ size: Size }>`
  position: relative;
  margin-bottom: ${({ size }) => (size === 'sm' && '8px') || (size === 'md' && '10px') || (size === 'lg' && '12px')};
  width: ${({ size }) => (size === 'sm' && '64px') || (size === 'md' && '150px') || (size === 'lg' && '208px')};
  height: ${({ size }) => (size === 'sm' && '64px') || (size === 'md' && '150px') || (size === 'lg' && '208px')};
  border-radius: 50%;
  overflow: hidden;

  * {
    position: absolute;
    width: 100%;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: 50%;
  }

  & > div {
    visibility: hidden;
    background: rgba(0, 0, 0, 60%);
  }

  :hover > div {
    visibility: visible;
  }
`

const UserAvatarEdit = styled(TYPE.body)`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`

const Rank = styled(RowCenter)<{ topCollector: boolean }>`
  gap: 4px;
  height: 18px;
  padding: 0 6px;
  border-radius: 9px;
  background: ${({ theme, topCollector }) => (topCollector ? theme.orange : theme.bg3)};
  margin-left: 4px;

  svg {
    fill: #fff;
  }
`

const StyledRankIcon = styled(RankIcon)`
  width: 10px;
`

const StyledCrown = styled(Crown)`
  width: 8px;
`

interface UserProps {
  username: string
  pictureUrl: string
  fallbackUrl: string
  certified: boolean
  size?: Size
  canEdit?: boolean
  cScore?: number
  displayRank?: boolean
}

export default function User({
  username,
  pictureUrl,
  fallbackUrl,
  certified,
  size = 'md',
  canEdit = false,
  cScore = 0,
  displayRank = false,
}: UserProps) {
  const toggleAvatarEditModal = useAvatarEditModalToggle()

  // rank
  const rank = useCScoreRank(displayRank ? cScore : 0)

  // top collector (if we dont have rank is not displayed, use algolia)
  let isTopCollector = useCScoreTopCollector(displayRank ? 0 : cScore)
  isTopCollector = useMemo(() => (rank ? rank <= TOP_COLLECTOR_RANK_MAX : isTopCollector), [isTopCollector, rank])

  return (
    <ColumnCenter>
      <UserAvatarWrapper size={size}>
        <Avatar src={pictureUrl} fallbackSrc={fallbackUrl} />
        {canEdit && (
          <UserAvatarEdit onClick={toggleAvatarEditModal}>
            <Trans>edit</Trans>
          </UserAvatarEdit>
        )}
      </UserAvatarWrapper>
      <Row gap={4}>
        <TYPE.body>{username}</TYPE.body>
        {certified && <Certified />}
        {!rank && isTopCollector && <TopCollector />}
        {rank ? (
          <Rank topCollector={isTopCollector}>
            {isTopCollector ? <StyledCrown /> : <StyledRankIcon />}
            <TYPE.body fontSize={12}>{rank}</TYPE.body>
          </Rank>
        ) : null}
      </Row>
    </ColumnCenter>
  )
}
