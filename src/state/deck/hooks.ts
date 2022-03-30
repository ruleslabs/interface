import { useCallback } from 'react'
import { DraggableEventHandler, DraggableData, DraggableEvent } from 'react-draggable'
import { gql } from '@apollo/client'
import { getApolloClient } from '@/apollo/apollo'

import { AppState } from '@/state'
import { useAppSelector, useAppDispatch } from '@/state/hooks'
import { setDeckCards, setDraggedDeckIndex, shiftDraggedCard, removeDeckCard, addDeckCard, DeckCard } from './actions'

const DRAGGING_ANIMATION_DURATION = 100 // 100ms

const SHIFT_SHOWCASED_DECK_CARD = gql`
  mutation ($cardSlug: String!, $newIndex: Int!) {
    shiftCardInDeck(input: { deckSlug: "showcase", cardSlug: $cardSlug, newIndex: $newIndex }) {
      error {
        code
        message
        path
      }
    }
  }
`

const REMOVE_SHOWCASED_DECK_CARD = gql`
  mutation ($cardIndex: Int!) {
    removeCardFromDeck(input: { deckSlug: "showcase", cardIndex: $cardIndex }) {
      error {
        code
        message
        path
      }
    }
  }
`

const ADD_SHOWCASED_DECK_CARD = gql`
  mutation ($cardSlug: String!) {
    addCardToDeck(input: { deckSlug: "showcase", cardSlug: $cardSlug }) {
      error {
        code
        message
        path
      }
    }
  }
`

export function useDeckState(): AppState['deck'] {
  return useAppSelector((state) => state.deck)
}

export function useSetDeckCards() {
  const dispatch = useAppDispatch()
  return useCallback((deckCards: DeckCard[]) => dispatch(setDeckCards({ deckCards })), [dispatch])
}

export function useDeckActionHandlers(): {
  onDraggingStart: DraggableEventHandler
  onDragging: (event: DraggableEvent, data: DraggableData, gap: number, width: number) => void
  onDraggingStop: DraggableEventHandler
  onRemove: (cardIndex: number) => void
  onInsertion: (card: any) => void
} {
  const dispatch = useAppDispatch()

  const {
    deckCards,
    draggedDeckIndex: { initial: draggedInitialIndex, current: draggedCurrentIndex },
  } = useDeckState()

  const onDraggingStart = useCallback(
    (event: DraggableEvent, data: DraggableData) => {
      const index = +((event?.target as HTMLDivElement)?.dataset.index ?? 0)
      dispatch(setDraggedDeckIndex({ initial: index, current: index }))
    },
    [dispatch]
  )

  const onDragging = useCallback(
    (event: DraggableEvent, data: DraggableData, gap: number, width: number) => {
      if (draggedInitialIndex === null) return

      // the magic function: offset = (2x + w) / (2w + 2g)
      const newIndex = Math.floor((2 * Math.abs(data.x) + width) / (2 * (width + gap)))
      const lastIndex = Math.floor((2 * Math.abs(data.lastX) + width) / (2 * (width + gap)))

      if (newIndex !== lastIndex) {
        dispatch(
          setDraggedDeckIndex({
            initial: draggedInitialIndex,
            current: Math.min(Math.max(draggedInitialIndex + Math.sign(data.x) * newIndex, 0), deckCards.length - 1),
          })
        )
      }
    },
    [dispatch, deckCards.length, draggedInitialIndex, setDraggedDeckIndex]
  )

  const onDraggingStop = useCallback(
    (event: DraggableEvent, data: DraggableData) => {
      if (draggedInitialIndex === null || draggedCurrentIndex === null) return

      // update deck on backend
      if (draggedInitialIndex !== draggedCurrentIndex) {
        const cardSlug = deckCards[draggedInitialIndex].card.slug
        const newIndex = deckCards[draggedCurrentIndex].cardIndex

        getApolloClient()
          ?.mutate({ mutation: SHIFT_SHOWCASED_DECK_CARD, variables: { cardSlug, newIndex } })
          .catch((err) => {
            console.error(err.message) // TODO push a popover to display the error
          })
      }

      // update deck on frontend
      setTimeout(() => {
        dispatch(shiftDraggedCard())
      }, DRAGGING_ANIMATION_DURATION)
    },
    [dispatch, deckCards, draggedInitialIndex, draggedCurrentIndex]
  )

  const onRemove = useCallback(
    (cardIndex: number) => {
      // update deck on backend
      getApolloClient()
        ?.mutate({ mutation: REMOVE_SHOWCASED_DECK_CARD, variables: { cardIndex } })
        .catch((err) => {
          console.error(err.message) // TODO push a popover to display the error
        })

      dispatch(removeDeckCard({ cardIndex }))
    },
    [dispatch]
  )

  const onInsertion = useCallback(
    (card: any) => {
      // update deck on backend
      getApolloClient()
        ?.mutate({ mutation: ADD_SHOWCASED_DECK_CARD, variables: { cardSlug: card.slug } })
        .catch((err) => {
          console.error(err.message) // TODO push a popover to display the error
        })

      dispatch(addDeckCard({ card }))
    },
    [dispatch]
  )

  return {
    onDraggingStart,
    onDragging,
    onDraggingStop,
    onRemove,
    onInsertion,
  }
}

export function useDeckDraggingOffset(gap: number, width: number) {
  const {
    draggedDeckIndex: { initial: draggedInitialIndex, current: draggedCurrentIndex },
  } = useDeckState()

  return useCallback(
    (index: number) => {
      if (draggedInitialIndex === null || draggedCurrentIndex === null) return 0

      if (index === draggedInitialIndex) {
        return (width + gap) * (draggedCurrentIndex - draggedInitialIndex)
      }
      if (draggedCurrentIndex > draggedInitialIndex && index <= draggedCurrentIndex && index > draggedInitialIndex) {
        return -width - gap
      }
      if (draggedCurrentIndex < draggedInitialIndex && index >= draggedCurrentIndex && index < draggedInitialIndex) {
        return width + gap
      }
      return 0
    },
    [width, draggedInitialIndex, draggedCurrentIndex]
  )
}

export function useDeckDraggingStyle() {
  const {
    draggedDeckIndex: { initial: draggedInitialIndex, current: draggedCurrentIndex },
  } = useDeckState()

  return useCallback(
    (index: number) => {
      if (draggedInitialIndex === null || draggedCurrentIndex === null) return {}

      return { transition: `transform ${DRAGGING_ANIMATION_DURATION}ms ease-out` }
    },
    [draggedInitialIndex, draggedCurrentIndex]
  )
}
