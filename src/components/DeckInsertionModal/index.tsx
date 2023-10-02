import { useMemo, useCallback, useState } from 'react'
import { t } from '@lingui/macro'

import { ModalHeader } from 'src/components/Modal'
import ClassicModal, { ModalContent, ModalBody } from 'src/components/Modal/Classic'
import { useModalOpened, useDeckInsertionModalToggle } from 'src/state/application/hooks'
import { ApplicationModal } from 'src/state/application/actions'
import Column from 'src/components/Column'
import { SearchBar } from 'src/components/Input'
import { useDeckState, useDeckActionHandlers } from 'src/state/deck/hooks'
import useDebounce from 'src/hooks/useDebounce'
import CollectionNfts from '../nft/Collection/CollectionNfts'
import { NftCard } from '../nft/Card'
import { useCards } from 'src/graphql/data/Cards'

interface DeckInsertionModalProps {
  address?: string
  cardIndex: number
}

export default function DeckInsertionModal({ address, cardIndex }: DeckInsertionModalProps) {
  const [search, setSearch] = useState('')

  // search bar
  const debouncedSearch = useDebounce(search, 200)
  const onSearchBarInput = useCallback((value) => setSearch(value), [setSearch])

  // modal
  const isOpen = useModalOpened(ApplicationModal.DECK_INSERTION)
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
      setSearch('')
      onInsertion({ card, cardIndex })
      toggleDeckInsertionModal()
    },
    [onInsertion, toggleDeckInsertionModal]
  )

  const {
    data: cards,
    loading,
    hasNext,
    loadMore,
  } = useCards(
    {
      filter: {
        ownerStarknetAddress: address ?? '0x0',
        search: debouncedSearch.length ? debouncedSearch : undefined,
        seasons: [],
        scarcityAbsoluteIds: [],
      },
    },
    !isOpen
  )

  const cardsComponents = useMemo(() => {
    if (!cards) return null

    return cards
      .filter((card) => {
        for (const cardIndex in deck) {
          if (deck[cardIndex]?.slug === card.slug) return false
        }
        return true
      })
      .map((card) => {
        return (
          <NftCard
            key={card.slug}
            asset={{
              animationUrl: card.cardModel.animationUrl,
              imageUrl: card.cardModel.imageUrl,
              tokenId: card.tokenId,
              scarcity: card.cardModel.scarcityName,
            }}
            display={{
              primaryInfo: card.cardModel.artistName,
              secondaryInfo: `#${card.serialNumber}`,
            }}
            onCardClick={() => handleCardInsertion(card)}
          />
        )
      })
  }, [cards, handleCardInsertion])

  return (
    <ClassicModal onDismiss={onDismiss} isOpen={isOpen}>
      <ModalContent fullscreen>
        <ModalHeader onDismiss={onDismiss} title={t`Deck`} />

        <ModalBody id="scrollableModal">
          <Column gap={32}>
            <SearchBar
              style={{ width: '100%' }}
              onUserInput={onSearchBarInput}
              placeholder={t`Search a card...`}
              value={search}
            />

            <CollectionNfts
              next={loadMore}
              hasNext={hasNext ?? false}
              dataLength={cards?.length ?? 0}
              scrollableTarget="scrollableModal"
              loading={loading}
            >
              {cardsComponents}
            </CollectionNfts>
          </Column>
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}
