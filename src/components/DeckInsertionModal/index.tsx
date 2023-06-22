import { useMemo, useCallback, useState } from 'react'
import { useLazyQuery, gql } from '@apollo/client'
import { t } from '@lingui/macro'

import { ModalHeader } from 'src/components/Modal'
import ClassicModal, { ModalContent, ModalBody } from 'src/components/Modal/Classic'
import { useModalOpened, useDeckInsertionModalToggle } from 'src/state/application/hooks'
import { ApplicationModal } from 'src/state/application/actions'
import Column from 'src/components/Column'
import { SearchBar } from 'src/components/Input'
import { useSearchCards } from 'src/state/search/hooks'
import { useDeckState, useDeckActionHandlers } from 'src/state/deck/hooks'
import useDebounce from 'src/hooks/useDebounce'
import CollectionNfts from '../nft/Collection/CollectionNfts'
import { NftCard } from '../nft/Card'

const CARDS_QUERY = gql`
  query ($ids: [ID!]!) {
    cardsByIds(ids: $ids) {
      id
      slug
      serialNumber
      tokenId
      cardModel {
        slug
        season
        pictureUrl(derivative: "width=1024")
        videoUrl
        artistName
        scarcity {
          name
        }
      }
    }
  }
`

interface DeckInsertionModalProps {
  address?: string
  cardIndex: number
}

export default function DeckInsertionModal({ address, cardIndex }: DeckInsertionModalProps) {
  const [cards, setCards] = useState<any[]>([])
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

  // query cards data
  const onCardsQueryCompleted = useCallback((data: any) => {
    setCards((state) => state.concat(data.cardsByIds))
  }, [])
  const [queryCardsData] = useLazyQuery(CARDS_QUERY, {
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
    facets: { ownerStarknetAddress: address, cardId: dashedDeckCardIds },
    search: debouncedSearch,
    skip: !isOpen || !address,
    onPageFetched,
  })

  const assets = useMemo(
    () =>
      cards.map((card) => (
        <NftCard
          key={card.slug}
          asset={{
            animationUrl: card.cardModel.videoUrl,
            imageUrl: card.cardModel.pictureUrl,
            tokenId: card.tokenId,
            scarcity: card.cardModel.scarcity.name,
          }}
          display={{
            primaryInfo: card.cardModel.artistName,
            secondaryInfo: card.serialNumber,
          }}
          onCardClick={() => handleCardInsertion(card)}
        />
      )),
    [cards]
  )

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
              next={cardsSearch.nextPage}
              hasNext={cardsSearch.hasNext}
              dataLength={cards.length}
              scrollableTarget="scrollableModal"
            >
              {assets}
            </CollectionNfts>
          </Column>
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}
