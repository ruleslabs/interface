import { useMemo, useCallback, useState, useEffect } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
import { t } from '@lingui/macro'

import Modal from '@/components/Modal'
import { useModalOpen, useDeckInsertionModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import Column from '@/components/Column'
import Row from '@/components/Row'
import { TYPE } from '@/styles/theme'
import Section from '@/components/Section'
import { SearchBar } from '@/components/Input'
import Grid from '@/components/Grid'
import { useSearchCards } from '@/state/search/hooks'
import { useDeckState, useDeckActionHandlers } from '@/state/deck/hooks'
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
  background: ${({ theme }) => theme.bg1};
  width: 100vw;
  height: 100vh;
`

const CardPicture = styled.img`
  width: 100%;
  cursor: pointer;
`

const CardName = styled(TYPE.body)`
  width: 100%;
`
const StyledClose = styled(Close)`
  width: 20px;
  height: 20px;
  cursor: pointer;
`

interface DeckInsertionModalProps {
  userId: string
  cardIndex: number
}

export default function DeckInsertionModal({ userId, cardIndex }: DeckInsertionModalProps) {
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
  const { deck } = useDeckState()

  const handleCardInsertion = useCallback(
    (card: any) => {
      setCards([])
      setCardsTable([])
      setSearch('')
      onInsertion({ card, cardIndex })
      toggleDeckInsertionModal()
    },
    [onInsertion, toggleDeckInsertionModal]
  )

  // result
  const [cards, setCards] = useState<any[]>([])
  const [cardsTable, setCardsTable] = useState<{ [key: string]: any }>({})

  const dashedDeckCardIds = useMemo(
    () =>
      Object.keys(deck).reduce<string[]>((acc, key: string) => {
        if (deck[+key]) acc.push(`-${deck[+key].id}`) // dashed to exclude them from the algolia search
        return acc
      }, []),
    [deck]
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
          <StyledClose onClick={onDismiss} />
        </Row>
        <Section marginTop="16px">
          <Column gap={32}>
            <SearchBar
              style={{ width: '100%' }}
              onUserInput={onSearchBarInput}
              placeholder={t`Search a card...`}
              value={search}
            />

            <Grid gap={64} maxWidth={256}>
              {cards.map((hit: any, index: number) => {
                const card = cardsTable[hit.cardId]

                return (
                  <Column key={`deck-insertion-card-${index}`} gap={12}>
                    <CardPicture src={card?.cardModel.pictureUrl} onClick={() => handleCardInsertion(card)} />
                    <CardName textAlign="center" spanColor="text2">
                      {hit.artistName}
                      <span> # {card?.serialNumber}</span>
                    </CardName>
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
