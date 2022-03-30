import { createReducer } from '@reduxjs/toolkit'

import { setDeckCards, setDraggedDeckIndex, shiftDraggedCard, removeDeckCard, addDeckCard, DeckCard } from './actions'

export interface DeckState {
  deckCards: DeckCard[]
  draggedDeckIndex: {
    initial: number | null
    current: number | null
  }
}

export const initialState: DeckState = {
  deckCards: [],
  draggedDeckIndex: {
    initial: null,
    current: null,
  },
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setDeckCards, (state, { payload: { deckCards } }) => {
      return {
        ...state,
        deckCards: [...deckCards].sort((a: DeckCard, b: DeckCard) => a.cardIndex - b.cardIndex),
      }
    })
    .addCase(setDraggedDeckIndex, (state, { payload: { initial, current } }) => {
      return {
        ...state,
        draggedDeckIndex: {
          initial,
          current,
        },
      }
    })
    .addCase(shiftDraggedCard, (state) => {
      const {
        deckCards,
        draggedDeckIndex: { initial: draggedInitialIndex, current: draggedCurrentIndex },
      } = state

      if (draggedInitialIndex === null || draggedCurrentIndex === null) return state

      if (draggedInitialIndex > draggedCurrentIndex) {
        for (let index = draggedCurrentIndex; index < draggedInitialIndex; ++index) ++deckCards[index].cardIndex
        deckCards[draggedInitialIndex].cardIndex = deckCards[draggedCurrentIndex].cardIndex - 1
      }

      if (draggedInitialIndex < draggedCurrentIndex) {
        for (let index = draggedCurrentIndex; index > draggedInitialIndex; --index) --deckCards[index].cardIndex
        deckCards[draggedInitialIndex].cardIndex = deckCards[draggedCurrentIndex].cardIndex + 1
      }

      // re sort cards

      state.deckCards = deckCards.sort((a: DeckCard, b: DeckCard) => a.cardIndex - b.cardIndex)

      // reset dragging indexes

      state.draggedDeckIndex.initial = null
      state.draggedDeckIndex.current = null

      return state
    })
    .addCase(removeDeckCard, (state, { payload: { cardIndex } }) => {
      const deckCards = state.deckCards
      let indexToRemove = -1

      for (const index of deckCards.keys()) {
        const deckCard = deckCards[index]

        if (deckCard.cardIndex > cardIndex) --deckCard.cardIndex
        else if (deckCard.cardIndex === cardIndex) indexToRemove = index
      }

      deckCards.splice(indexToRemove, 1)

      return state
    })
    .addCase(addDeckCard, (state, { payload: { card } }) => {
      state.deckCards.push({ cardIndex: state.deckCards.length + 1, card })

      return state
    })
)
