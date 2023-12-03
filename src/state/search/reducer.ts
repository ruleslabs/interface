import { createReducer } from '@reduxjs/toolkit'
import { constants } from '@rulesorg/sdk-core'

import {
  updateCardsScarcityFilter,
  updateCardsSeasonsFilter,
  updateMarketplaceLowSerialsFilter,
  updateMarketplaceScarcityFilter,
  updateMarketplaceSeasonsFilter,
} from './actions'

interface MarketplaceState {
  marketplaceFilters: {
    scarcities: number[]
    seasons: number[]
    lowSerials: boolean
  }
  cardsFilters: {
    scarcities: number[]
    seasons: number[]
  }
}

const initialState: MarketplaceState = {
  marketplaceFilters: {
    scarcities: Object.values(constants.ScarcityName).map((_, index) => index),
    seasons: Object.keys(constants.Seasons).map((season) => +season),
    lowSerials: false,
  },
  cardsFilters: {
    scarcities: Object.values(constants.ScarcityName).map((_, index) => index),
    seasons: Object.keys(constants.Seasons).map((season) => +season),
  },
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateMarketplaceScarcityFilter, (state, { payload: { scarcity } }) => {
      const scarcities = state.marketplaceFilters.scarcities

      if (scarcities.includes(scarcity)) state.marketplaceFilters.scarcities = scarcities.filter((e) => e !== scarcity)
      else scarcities.push(scarcity)
    })
    .addCase(updateMarketplaceSeasonsFilter, (state, { payload: { season } }) => {
      const seasons = state.marketplaceFilters.seasons

      if (seasons.includes(season)) state.marketplaceFilters.seasons = seasons.filter((e) => e !== season)
      else seasons.push(season)
    })
    .addCase(updateMarketplaceLowSerialsFilter, (state) => {
      state.marketplaceFilters.lowSerials = !state.marketplaceFilters.lowSerials
    })

    .addCase(updateCardsScarcityFilter, (state, { payload: { scarcity } }) => {
      const scarcities = state.cardsFilters.scarcities

      if (scarcities.includes(scarcity)) state.cardsFilters.scarcities = scarcities.filter((e) => e !== scarcity)
      else scarcities.push(scarcity)
    })
    .addCase(updateCardsSeasonsFilter, (state, { payload: { season } }) => {
      const seasons = state.cardsFilters.seasons

      if (seasons.includes(season)) state.cardsFilters.seasons = seasons.filter((e) => e !== season)
      else seasons.push(season)
    })
)
