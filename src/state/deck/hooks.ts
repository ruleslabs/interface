import { useCallback } from 'react'
import { gql } from '@apollo/client'
import { getApolloClient } from '@/apollo/apollo'

import { AppState } from '@/state'
import { useAppSelector, useAppDispatch } from '@/state/hooks'
import { setDeckCards, removeDeckCard, addDeckCard, DeckCard } from './actions'

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
  mutation ($cardSlug: String!, $cardIndex: Int!) {
    addCardToDeck(input: { deckSlug: "showcase", cardSlug: $cardSlug, cardIndex: $cardIndex }) {
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
  onRemove: (cardIndex: number) => void
  onInsertion: (card: any) => void
} {
  const dispatch = useAppDispatch()

  const { deck } = useDeckState()

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
    (deckCard: DeckCard) => {
      // update deck on backend
      getApolloClient()
        ?.mutate({
          mutation: ADD_SHOWCASED_DECK_CARD,
          variables: { cardSlug: deckCard.card.slug, cardIndex: deckCard.cardIndex },
        })
        .catch((err) => {
          console.error(err.message) // TODO push a popover to display the error
        })

      dispatch(addDeckCard({ deckCard }))
    },
    [dispatch]
  )

  return { onRemove, onInsertion }
}
