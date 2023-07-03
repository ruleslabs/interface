import { createReducer } from '@reduxjs/toolkit'

import {
  updateMarketplaceScarcityFilter,
  updateMarketplaceSeasonsFilter,
  updateMarketplaceLowSerialsFilter,
  updateMarketplaceMaximumPrice,
} from './actions'
import { constants } from '@rulesorg/sdk-core'

export interface MarketplaceState {
  filters: {
    scarcities: number[]
    seasons: number[]
    maximumPrice: number | null
    lowSerials: boolean
  }
}

export const initialState: MarketplaceState = {
  filters: {
    scarcities: Object.values(constants.ScarcityName).map((_, index) => index),
    seasons: Object.keys(constants.Seasons).map((season) => +season),
    maximumPrice: null,
    lowSerials: false,
  },
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateMarketplaceScarcityFilter, (state, { payload: { scarcity } }) => {
      const scarcities = state.filters.scarcities

      if (scarcities.includes(scarcity)) state.filters.scarcities = scarcities.filter((e) => e !== scarcity)
      else scarcities.push(scarcity)

      // reset max price
      state.filters.maximumPrice = null
    })
    .addCase(updateMarketplaceSeasonsFilter, (state, { payload: { season } }) => {
      const seasons = state.filters.seasons

      if (seasons.includes(season)) state.filters.seasons = seasons.filter((e) => e !== season)
      else seasons.push(season)

      // reset max price
      state.filters.maximumPrice = null
    })
    .addCase(updateMarketplaceLowSerialsFilter, (state) => {
      state.filters.lowSerials = !state.filters.lowSerials

      // reset max price
      state.filters.maximumPrice = null
    })
    .addCase(updateMarketplaceMaximumPrice, (state, { payload: { price } }) => {
      state.filters.maximumPrice = price
    })
)
