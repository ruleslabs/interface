import React, { useCallback, useEffect, useState } from 'react'
import { constants } from '@rulesorg/sdk-core'
import { Trans, t } from '@lingui/macro'

import Column from 'src/components/Column'
import Checkbox from 'src/components/Checkbox'
import Slider from 'src/components/Slider'
import { TYPE } from 'src/styles/theme'
import { useMarketplaceFilters, useMarketplaceFiltersHandlers } from 'src/state/search/hooks'
import Subtitle from 'src/components/Text/Subtitle'
import Divider from 'src/components/Divider'
import usePrevious from 'src/hooks/usePrevious'
import useTrans from 'src/hooks/useTrans'

interface MarketplaceFiltersProps extends React.HTMLAttributes<HTMLDivElement> {
  maximumPriceUpperBound: number
}

export default function MarketplaceFilters({ maximumPriceUpperBound, ...props }: MarketplaceFiltersProps) {
  // trans
  const trans = useTrans()

  const filters = useMarketplaceFilters()

  const {
    toggleScarcityFilter,
    toggleSeasonFilter,
    toggleLowSerialsFilter,
    setMaximumPrice: setMarketplaceMaximumPrice,
  } = useMarketplaceFiltersHandlers()

  // max price (only update filtered maximum price when this value get debounced)
  const [maximumPrice, setMaximumPrice] = useState(filters.maximumPrice ?? maximumPriceUpperBound)

  // max price debounce
  const debounceMaximumPrice = useCallback(() => setMarketplaceMaximumPrice(maximumPrice), [maximumPrice])
  const handleDebouncedMaximumPriceUpdate = useCallback((value: number) => {
    setMaximumPrice(value)
    setMarketplaceMaximumPrice(value)
  }, [])

  // update maximum price on highest low update but not on component mount
  const previousMaximumPriceUpperBound = usePrevious(maximumPriceUpperBound)

  useEffect(() => {
    if (previousMaximumPriceUpperBound !== undefined && previousMaximumPriceUpperBound !== maximumPriceUpperBound) {
      setMarketplaceMaximumPrice(maximumPriceUpperBound)
      setMaximumPrice(maximumPriceUpperBound)
    }
  }, [setMarketplaceMaximumPrice, maximumPriceUpperBound, previousMaximumPriceUpperBound])

  // reset maximum price filter value when null
  useEffect(() => {
    if (filters.maximumPrice === null) {
      setMarketplaceMaximumPrice(maximumPriceUpperBound)
    }
  }, [filters.maximumPrice, maximumPriceUpperBound])

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

      {false && (
        <>
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
        </>
      )}
    </Column>
  )
}
