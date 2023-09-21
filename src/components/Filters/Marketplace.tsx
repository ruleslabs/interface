import React from 'react'
import { constants } from '@rulesorg/sdk-core'
import { Trans, t } from '@lingui/macro'

import Column from 'src/components/Column'
import Checkbox from 'src/components/Checkbox'
import { TYPE } from 'src/styles/theme'
import { useMarketplaceFilters, useMarketplaceFiltersHandlers } from 'src/state/search/hooks'
import Subtitle from 'src/components/Text/Subtitle'
import Divider from 'src/components/Divider'
import useTrans from 'src/hooks/useTrans'

export default function MarketplaceFilters(props: React.HTMLAttributes<HTMLDivElement>) {
  // trans
  const trans = useTrans()

  const filters = useMarketplaceFilters()

  const { toggleScarcityFilter, toggleSeasonFilter, toggleLowSerialsFilter } = useMarketplaceFiltersHandlers()

  return (
    <Column gap={24} {...props}>
      <Column gap={12}>
        <Subtitle value={t`Seasons`} />

        {Object.keys(constants.Seasons).map((season) => (
          <Checkbox key={season} value={filters.seasons.includes(+season)} onChange={() => toggleSeasonFilter(+season)}>
            <TYPE.body>
              <Trans>Season {season}</Trans>
            </TYPE.body>
          </Checkbox>
        ))}
      </Column>

      <Divider />

      <Column gap={12}>
        <Subtitle value={t`Scarcities`} />

        {Object.values(constants.ScarcityName).map((scarcity, index) => (
          <Checkbox
            key={scarcity}
            value={filters.scarcities.includes(index)}
            onChange={() => toggleScarcityFilter(index)}
          >
            <TYPE.body>{trans('scarcity', scarcity)}</TYPE.body>
          </Checkbox>
        ))}
      </Column>

      <Divider />

      <Column gap={12}>
        <Subtitle value={t`Serial numbers`} />

        <Checkbox value={filters.lowSerials} onChange={toggleLowSerialsFilter}>
          <TYPE.body>
            <Trans>Low serials</Trans>
          </TYPE.body>
        </Checkbox>
      </Column>
    </Column>
  )
}
