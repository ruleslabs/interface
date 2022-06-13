import { createAction } from '@reduxjs/toolkit'

export const updateMarketplaceScarcityFilter = createAction<{ tier: string }>('search/updateMarketplaceScarcityFilter')
export const updateMarketplaceSeasonsFilter = createAction<{ season: number }>('search/updateMarketplaceSeasonsFilter')
export const updateMarketplaceMaximumPrice = createAction<{ price: number }>('search/updateMarketplaceMaximumPrice')
