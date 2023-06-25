import { useMemo } from 'react'

import { TOP_COLLECTOR_RANK_MAX } from 'src/constants/misc'

export function useCScoreTopCollector(rank: number): boolean {
  return useMemo(() => rank <= TOP_COLLECTOR_RANK_MAX, [rank])
}
