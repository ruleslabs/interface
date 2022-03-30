import { useMemo, useCallback, useState, useEffect } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'

import Modal from '@/components/Modal'
import { useModalOpen, useDeckInsertionModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { IconButton } from '@/components/Button'
import Column from '@/components/Column'
import Row from '@/components/Row'
import { TYPE } from '@/styles/theme'
import Section from '@/components/Section'
import { SearchBar } from '@/components/Input'
import Grid from '@/components/Grid'
import { useSearchCards } from '@/state/search/hooks'
import { useDeckState, useDeckActionHandlers } from '@/state/deck/hooks'
import { DeckCard } from '@/state/deck/actions'
import useDebounce from '@/hooks/useDebounce'

import Close from '@/images/close.svg'

const QUERY_CARDS = gql`
  query ($ids: [ID!]!) {
    cardsByIds(ids: $ids) {
      id
      slug
      serialNumber
      cardModel {
        slug
        pictureUrl(derivative: "width=512")
      }
    }
  }
`

const StyledDeckInsertionModal = styled.div`
  padding: 16px;
  background: ${({ theme }) => theme.bg2};
  width: 100vw;
  height: 100vh;
`

const CardPicture = styled.img`
  width: 100%;
  cursor: pointer;
`

export default function DeckInsertionModal({ userId }: { userId: string }) {
  // search bar
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 200)
  const onSearchBarInput = useCallback((value) => setSearch(value), [setSearch])

  // modal
  const isOpen = useModalOpen(ApplicationModal.DECK_INSERTION)
  const toggleDeckInsertionModal = useDeckInsertionModalToggle()
  const onDismiss = useCallback(() => {
    setSearch('')
    toggleDeckInsertionModal()
  }, [toggleDeckInsertionModal, setSearch])

  // deck
  const { onInsertion } = useDeckActionHandlers()
  const { deckCards } = useDeckState()

  const handleCardInsertion = useCallback(
    (card: any) => {
      setCards([])
      setCardsTable([])
      setSearch('')
      onInsertion(card)
      toggleDeckInsertionModal()
    },
    [onInsertion, toggleDeckInsertionModal]
  )

  // result
  const [cards, setCards] = useState<any[]>([])
  const [cardsTable, setCardsTable] = useState<{ [key: string]: any }>({})

  const dashedDeckCardIds = useMemo(
    () =>
      deckCards.reduce<string[]>((acc, deckCard: DeckCard) => {
        acc.push(`-${deckCard.card.id}`) // dashed to exclude them from the algolia search
        return acc
      }, []),
    [deckCards.length]
  )

  const {
    hits: cardsHits,
    loading: cardsHitsLoading,
    error: cardsHitsError,
  } = useSearchCards({
    facets: { ownerUserId: userId, cardId: dashedDeckCardIds },
    search: debouncedSearch,
    skip: !isOpen,
  })

  const cardIds = useMemo(
    () =>
      (cardsHits ?? []).reduce<string[]>((acc, hit: any) => {
        acc.push(hit.cardId)

        return acc
      }, []),
    [cardsHits]
  )

  useEffect(() => {
    if (cardsHitsLoading) return

    setCards(cardsHits ?? [])
  }, [cardsHits, setCards])

  const {
    data: cardsData,
    loading: cardsLoading,
    error: cardsError,
  } = useQuery(QUERY_CARDS, { variables: { ids: cardIds }, skip: !cardIds.length || !isOpen })

  useEffect(() => {
    if (cardsLoading) return

    setCardsTable(
      ((cardsData?.cardsByIds ?? []) as any[]).reduce<{ [key: string]: any }>((acc, card: any) => {
        acc[card.id] = card
        return acc
      }, {})
    )
  }, [cardsData?.cardsByIds, setCardsTable])

  const isValid = !cardsHitsError && !cardsError
  const isLoading = cardsHitsLoading || cardsLoading

  return (
    <Modal onDismiss={onDismiss} isOpen={isOpen}>
      <StyledDeckInsertionModal>
        <Row justify="flex-end">
          <IconButton onClick={onDismiss}>
            <Close />
          </IconButton>
        </Row>
        <Section marginTop="16px">
          <Column gap={32}>
            <SearchBar
              style={{ width: '100%' }}
              onUserInput={onSearchBarInput}
              placeholder="Chercher une carte..."
              value={search}
            />
            <Grid gap={64} maxWidth={256}>
              {cards.map((hit: any, index: number) => {
                const card = cardsTable[hit.cardId]

                return (
                  <Column key={`deck-insertion-card-${index}`} gap={12}>
                    <CardPicture src={card?.cardModel.pictureUrl} onClick={() => handleCardInsertion(card)} />
                    <TYPE.body textAlign="center">
                      {hit.artistName}
                      <span style={{ opacity: 0.5 }}> # {card?.serialNumber}</span>
                    </TYPE.body>
                  </Column>
                )
              })}
            </Grid>
          </Column>
        </Section>
      </StyledDeckInsertionModal>
    </Modal>
  )
}
