import { useMemo } from 'react'
import styled from 'styled-components/macro'

import { RowCenter } from 'src/components/Row'
import { TOP_COLLECTOR_RANK_MAX } from 'src/constants/misc'
import { TYPE } from 'src/styles/theme'

import { ReactComponent as CrownIcon } from 'src/images/crown.svg'
import { ReactComponent as RankIcon } from 'src/images/rank.svg'

const Rank = styled(RowCenter)<{ topCollector: boolean }>`
  gap: 4px;
  height: 18px;
  padding: 0 6px;
  border-radius: 9px;
  background: ${({ theme, topCollector }) => (topCollector ? theme.orange : theme.bg3)};
  margin-left: 4px;
`

const StyledCrownIcon = styled(CrownIcon)`
  width: 8px;
  fill: #fff;
`

const StyledRankIcon = styled(RankIcon)`
  width: 10px;
  fill: #fff;
`

interface UserRankProps {
  rank: number
}

export default function UserRank({ rank }: UserRankProps) {
  const isTopCollector = useMemo(() => rank <= TOP_COLLECTOR_RANK_MAX, [rank])

  return (
    <Rank topCollector={isTopCollector}>
      {isTopCollector ? <StyledCrownIcon /> : <StyledRankIcon />}
      <TYPE.body fontSize={12}>{rank}</TYPE.body>
    </Rank>
  )
}
