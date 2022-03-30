import { createReducer } from '@reduxjs/toolkit'

import { updateMarketplaceTiersFilter, updateMarketplaceSeasonsFilter } from './actions'

export interface MarketplaceState {
  filters: {
    tiers: string[]
    seasons: number[]
  }
}

export const initialState: MarketplaceState = {
  filters: {
    tiers: [],
    seasons: [],
  },
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateMarketplaceTiersFilter, (state, { payload: { tier } }) => {
      const tiers = state.filters.tiers

      return {
        ...state,
        filters: {
          ...state.filters,
          tiers: tiers.includes(tier) ? tiers.filter((e) => e !== tier) : [...tiers, tier],
        },
      }
    })
    .addCase(updateMarketplaceSeasonsFilter, (state, { payload: { season } }) => {
      const seasons = state.filters.seasons

      return {
        ...state,
        filters: {
          ...state.filters,
          seasons: seasons.includes(season) ? seasons.filter((e) => e !== season) : [...seasons, season],
        },
      }
    })
)
