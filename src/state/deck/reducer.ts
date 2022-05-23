import { createReducer } from '@reduxjs/toolkit'

import { setDeckCards, removeDeckCard, addDeckCard, Deck } from './actions'

export interface DeckState {
  deck: Deck
}

export const initialState: DeckState = {
  deck: {},
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setDeckCards, (state, { payload: { deckCards } }) => {
      state.deck = []
      for (const deckCard of deckCards) {
        state.deck[deckCard.cardIndex] = deckCard.card
      }
    })
    .addCase(removeDeckCard, (state, { payload: { cardIndex } }) => {
      delete state.deck[cardIndex]
    })
    .addCase(addDeckCard, (state, { payload: { deckCard } }) => {
      state.deck[deckCard.cardIndex] = deckCard.card
    })
)
