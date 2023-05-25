import { useMemo } from 'react'

import { useSearchUsers } from 'src/state/search/hooks'
import { TOP_COLLECTOR_RANK_MAX } from 'src/constants/misc'

export function useCScoreRank(cScore = 0): number {
  // user rank
  const userRankSearch = useSearchUsers({
    sortingKey: 'cScore',
    hitsPerPage: 0,
    filters: `cScore > ${cScore}`,
    skip: !cScore,
  })
  const userRank = useMemo(
    () => (userRankSearch?.nbHits !== undefined ? userRankSearch?.nbHits + 1 : 0),
    [userRankSearch?.nbHits]
  )

  return userRank
}

export function useCScoreTopCollector(cScore: number): boolean {
  // get the lowest cScore possible for a top collector
  const userTopCollectorSearch = useSearchUsers({
    sortingKey: 'cScore',
    hitsPerPage: 1,
    pageNumber: TOP_COLLECTOR_RANK_MAX,
    skip: !cScore,
  })
  const isTopCollector = useMemo(
    () => (userTopCollectorSearch?.hits?.[0]?.cScore ? userTopCollectorSearch.hits[0].cScore <= cScore : false),
    [userTopCollectorSearch?.hits?.[0]?.cScore]
  )

  return isTopCollector
}
