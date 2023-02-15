import { createAction } from '@reduxjs/toolkit'

export const updateMarketplaceScarcityFilter = createAction<{ scarcity: number }>(
  'search/updateMarketplaceScarcityFilter'
)
export const updateMarketplaceSeasonsFilter = createAction<{ season: number }>('search/updateMarketplaceSeasonsFilter')
export const updateMarketplaceLowSerialsFilter = createAction('search/updateMarketplaceLowSerialsFilter')
export const updateMarketplaceMaximumPrice = createAction<{ price: number }>('search/updateMarketplaceMaximumPrice')
