import { createAction } from '@reduxjs/toolkit'

// Marketplace filters
export const updateMarketplaceScarcityFilter = createAction<{ scarcity: number }>(
  'search/updateMarketplaceScarcityFilter'
)
export const updateMarketplaceSeasonsFilter = createAction<{ season: number }>('search/updateMarketplaceSeasonsFilter')
export const updateMarketplaceLowSerialsFilter = createAction('search/updateMarketplaceLowSerialsFilter')

// Cards filters
export const updateCardsScarcityFilter = createAction<{ scarcity: number }>('search/updateCardsScarcityFilter')
export const updateCardsSeasonsFilter = createAction<{ season: number }>('search/updateCardsSeasonsFilter')
