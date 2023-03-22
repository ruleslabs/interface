import React, { useCallback, useEffect, useState } from 'react'
import { Seasons, ScarcityName } from '@rulesorg/sdk-core'
import { Trans, t } from '@lingui/macro'

import Column from '@/components/Column'
import Checkbox from '@/components/Checkbox'
import Slider from '@/components/Slider'
import { TYPE } from '@/styles/theme'
import { useMarketplaceFilters, useMarketplaceFiltersHandlers } from '@/state/search/hooks'
import Subtitle from '@/components/Text/Subtitle'
import Divider from '@/components/Divider'

interface MarketplaceFiltersProps extends React.HTMLAttributes<HTMLDivElement> {
  maximumPriceUpperBound: number
}

export default function MarketplaceFilters({ maximumPriceUpperBound, ...props }: MarketplaceFiltersProps) {
  const filters = useMarketplaceFilters()

  const {
    toggleScarcityFilter,
    toggleSeasonFilter,
    toggleLowSerialsFilter,
    setMaximumPrice: setMarketplaceMaximumPrice,
  } = useMarketplaceFiltersHandlers()

  // max price
  const [maximumPrice, setMaximumPrice] = useState(maximumPriceUpperBound)

  // max price debounce
  const debounceMaximumPrice = useCallback(() => setMarketplaceMaximumPrice(maximumPrice), [maximumPrice])
  const handleDebouncedMaximumPriceUpdate = useCallback((value: number) => {
    setMaximumPrice(value)
    setMarketplaceMaximumPrice(value)
  }, [])

  useEffect(() => {
    setMarketplaceMaximumPrice(maximumPriceUpperBound)
    setMaximumPrice(maximumPriceUpperBound)
  }, [setMarketplaceMaximumPrice, maximumPriceUpperBound])

  return (
    <Column gap={24} {...props}>
      <Column gap={12}>
        <Subtitle value={t`Seasons`} />

        {Object.keys(Seasons).map((season: string) => (
          <Checkbox
            key={`checkbox-season-${season}`}
            value={!filters.seasons.includes(+season)}
            onChange={() => toggleSeasonFilter(+season)}
          >
            <TYPE.body>
              <Trans>Season {season}</Trans>
            </TYPE.body>
          </Checkbox>
        ))}
      </Column>

      <Divider />

      <Column gap={12}>
        <Subtitle value={t`Scarcities`} />

        {ScarcityName.map((scarcity: string, index) => (
          <Checkbox
            key={`checkbox-tier-${scarcity}`}
            value={!filters.scarcities.includes(index)}
            onChange={() => toggleScarcityFilter(index)}
          >
            <Trans id={scarcity} render={({ translation }) => <TYPE.body>{translation}</TYPE.body>} />
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

      <Divider />

      <Column gap={16}>
        <Subtitle value={t`Maximum price`} />

        <Slider
          unit="€"
          min={0}
          max={maximumPriceUpperBound}
          onInputChange={handleDebouncedMaximumPriceUpdate}
          onSlidingChange={setMaximumPrice}
          value={maximumPrice}
          onSliderRelease={debounceMaximumPrice}
        />
      </Column>
    </Column>
  )
}
