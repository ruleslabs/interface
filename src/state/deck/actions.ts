import { createAction } from '@reduxjs/toolkit'

export interface DeckCard {
  cardIndex: number
  card: any
}

export const setDeckCards = createAction<{ deckCards: DeckCard[] }>('deck/setDeckCards')
export const setDraggedDeckIndex = createAction<{ initial: number | null; current: number | null }>(
  'deck/setDraggedDeckIndex'
)
export const shiftDraggedCard = createAction('deck/shiftDraggedCard')
export const removeDeckCard = createAction<{ cardIndex: number }>('deck/removeDeckCard')
export const addDeckCard = createAction<{ card: any }>('deck/addDeckCard')
