import { createAction } from '@reduxjs/toolkit'

export interface DeckCard {
  cardIndex: number
  card: any
}

export interface Deck {
  [cardIndex: DeckCard['cardIndex']]: DeckCard['card']
}

export const setDeckCards = createAction<{ deckCards: DeckCard[] }>('deck/setDeckCards')

export const removeDeckCard = createAction<{ cardIndex: number }>('deck/removeDeckCard')
export const addDeckCard = createAction<{ deckCard: DeckCard }>('deck/addDeckCard')
