import { t, Trans } from '@lingui/macro'
import { constants } from '@rulesorg/sdk-core'
import React from 'react'
import Checkbox from 'src/components/Checkbox'
import Column from 'src/components/Column'
import Divider from 'src/components/Divider'
import Subtitle from 'src/components/Text/Subtitle'
import useTrans from 'src/hooks/useTrans'
import { useCardsFilters, useCardsFiltersHandlers } from 'src/state/search/hooks'
import { TYPE } from 'src/styles/theme'

export default function CardsFilters(props: React.HTMLAttributes<HTMLDivElement>) {
  // trans
  const trans = useTrans()

  const filters = useCardsFilters()

  const { toggleScarcityFilter, toggleSeasonFilter } = useCardsFiltersHandlers()

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
    </Column>
  )
}
