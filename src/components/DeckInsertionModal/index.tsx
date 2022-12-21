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
import useWindowSize from '@/hooks/useWindowSize'

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
        videoUrl
      }
    }
  }
`

const StyledDeckInsertionModal = styled.div<{ windowHeight?: number }>`
  padding: 16px;
  background: ${({ theme }) => theme.bg1};
  width: 100vw;
  height: ${({ windowHeight }) => windowHeight}px;
  overflow: scroll;
`

const CardPicture = styled.img`
  width: 100%;
  cursor: pointer;
  border-radius: 4.44%/3.17%;
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
  starknetWalletAddress: string
  cardIndex: number
}

export default function DeckInsertionModal({ starknetWalletAddress, cardIndex }: DeckInsertionModalProps) {
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
    facets: { ownerStarknetAddress: starknetWalletAddress, cardId: dashedDeckCardIds },
    search: debouncedSearch,
    skip: !isOpen,
  })

  const cardIds = useMemo(
    () =>
      ((cardsHits ?? []) as any[]).reduce<string[]>((acc, hit: any) => {
        acc.push(hit.objectID)
        return acc
      }, []),
    [cardsHits]
  )

  useEffect(() => {
    if (cardsHitsLoading) return

    setCards(cardsHits ?? [])
  }, [cardsHits, setCards])

  const cardsQuery = useQuery(QUERY_CARDS, { variables: { ids: cardIds }, skip: !cardIds.length || !isOpen })

  useEffect(() => {
    setCardsTable(
      ((cardsQuery.data?.cardsByIds ?? []) as any[]).reduce<{ [key: string]: any }>((acc, card: any) => {
        acc[card.id] = card
        return acc
      }, {})
    )
  }, [!!cardsQuery.data?.cardsByIds])

  // window size
  const windowSize = useWindowSize()

  const isValid = !cardsHitsError && !cardsQuery.error
  const isLoading = cardsHitsLoading || cardsQuery.loading

  return (
    <Modal onDismiss={onDismiss} isOpen={isOpen}>
      <StyledDeckInsertionModal windowHeight={windowSize.height}>
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
                const card = cardsTable[hit.objectID]

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
