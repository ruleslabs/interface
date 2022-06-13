import { createReducer } from '@reduxjs/toolkit'

import {
  updateMarketplaceScarcityFilter,
  updateMarketplaceSeasonsFilter,
  updateMarketplaceMaximumPrice,
} from './actions'

export interface MarketplaceState {
  filters: {
    scarcities: string[]
    seasons: number[]
    maximumPrice: number | null
  }
}

export const initialState: MarketplaceState = {
  filters: {
    scarcities: [],
    seasons: [],
    maximumPrice: null,
  },
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateMarketplaceScarcityFilter, (state, { payload: { scarcity } }) => {
      const scarcities = state.filters.scarcities

      if (scarcities.includes(scarcity)) state.filters.scarcities = scarcities.filter((e) => e !== scarcity)
      else scarcities.push(scarcity)
    })
    .addCase(updateMarketplaceSeasonsFilter, (state, { payload: { season } }) => {
      const seasons = state.filters.seasons

      if (seasons.includes(season)) state.filters.seasons = seasons.filter((e) => e !== season)
      else seasons.push(season)
    })
    .addCase(updateMarketplaceMaximumPrice, (state, { payload: { price } }) => {
      state.filters.maximumPrice = price
    })
)
