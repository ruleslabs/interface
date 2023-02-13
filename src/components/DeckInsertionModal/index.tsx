import { useMemo, useCallback, useState } from 'react'
import styled from 'styled-components'
import { useLazyQuery, gql } from '@apollo/client'
import { t } from '@lingui/macro'

import Modal, { ModalHeader } from '@/components/Modal'
import { useModalOpen, useDeckInsertionModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import Column from '@/components/Column'
import Section from '@/components/Section'
import { SearchBar } from '@/components/Input'
import Grid from '@/components/Grid'
import { useSearchCards } from '@/state/search/hooks'
import { useDeckState, useDeckActionHandlers } from '@/state/deck/hooks'
import useDebounce from '@/hooks/useDebounce'
import useWindowSize from '@/hooks/useWindowSize'
import CardModel from '@/components/CardModel'
import useInfiniteScroll from '@/hooks/useInfiniteScroll'
import { PaginationSpinner } from '@/components/Spinner'

const CARDS_QUERY = gql`
  query ($ids: [ID!]!) {
    cardsByIds(ids: $ids) {
      id
      slug
      serialNumber
      onSale
      cardModel {
        slug
        season
        pictureUrl(derivative: "width=1024")
        videoUrl
        artist {
          displayName
        }
      }
    }
  }
`

const StyledDeckInsertionModal = styled.div<{ windowHeight?: number }>`
  padding: 16px 40px;
  background: ${({ theme }) => theme.bg1};
  width: 100vw;
  height: ${({ windowHeight }) => windowHeight}px;
  overflow: scroll;

  ${({ theme }) => theme.media.medium`
    padding: 16px;
  `}
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
      setSearch('')
      onInsertion({ card, cardIndex })
      toggleDeckInsertionModal()
    },
    [onInsertion, toggleDeckInsertionModal]
  )

  // cards already in deck
  const dashedDeckCardIds = useMemo(
    () =>
      Object.keys(deck).reduce<string[]>((acc, key: string) => {
        if (deck[+key]) acc.push(`-${deck[+key].id}`) // dashed to exclude them from the algolia search
        return acc
      }, []),
    [deck]
  )

  // tables
  const [cards, setCards] = useState<any[]>([])

  // query cards data
  const onCardsQueryCompleted = useCallback(
    (data: any) => {
      setCards(cards.concat(data.cardsByIds))
    },
    [cards.length]
  )
  const [queryCardsData, cardsQuery] = useLazyQuery(CARDS_QUERY, {
    onCompleted: onCardsQueryCompleted,
    fetchPolicy: 'cache-and-network',
  })

  // search cards
  const onPageFetched = useCallback(
    (hits, { pageNumber }) => {
      if (!pageNumber) setCards([])

      queryCardsData({ variables: { ids: hits.map((hit: any) => hit.objectID) } })
    },
    [queryCardsData]
  )
  const cardsSearch = useSearchCards({
    facets: { ownerStarknetAddress: starknetWalletAddress, cardId: dashedDeckCardIds },
    search: debouncedSearch,
    skip: !isOpen,
    onPageFetched,
  })

  // loading
  const isLoading = cardsSearch.loading || cardsQuery.loading

  // infinite scroll
  const lastTxRef = useInfiniteScroll({ nextPage: cardsSearch.nextPage, loading: isLoading })

  // window size
  const windowSize = useWindowSize()

  return (
    <Modal onDismiss={onDismiss} isOpen={isOpen}>
      <StyledDeckInsertionModal windowHeight={windowSize.height}>
        <ModalHeader onDismiss={onDismiss} />

        <Section marginTop="16px">
          <Column gap={32}>
            <SearchBar
              style={{ width: '100%' }}
              onUserInput={onSearchBarInput}
              placeholder={t`Search a card...`}
              value={search}
            />

            <Grid gap={64} maxWidth={256}>
              {cards.map((card, index) => (
                <CardModel
                  key={card.slug}
                  innerRef={index + 1 === cards.length ? lastTxRef : undefined}
                  cardModelSlug={card.cardModel.slug}
                  pictureUrl={card.cardModel.pictureUrl}
                  serialNumber={card.serialNumber}
                  season={card.cardModel.season}
                  artistName={card.cardModel.artist.displayName}
                  onSale={card.onSale}
                  onClick={() => handleCardInsertion(card)}
                />
              ))}
            </Grid>

            <PaginationSpinner loading={isLoading} />
          </Column>
        </Section>
      </StyledDeckInsertionModal>
    </Modal>
  )
}
