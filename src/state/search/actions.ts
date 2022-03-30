import { createAction } from '@reduxjs/toolkit'

export const updateMarketplaceTiersFilter = createAction<{ tier: string }>('search/updateMarketplaceTiersFilter')
export const updateMarketplaceSeasonsFilter = createAction<{ season: number }>('search/updateMarketplaceSeasonsFilter')
export const updateMarketplacePriceRange = createAction<{ price: number }>('search/updateMarketplacePriceRange')
