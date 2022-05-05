import React, { useRef, useEffect, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
import { useRouter } from 'next/router'
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable'

import Link from '@/components/Link'
import DefaultLayout from '@/components/Layout'
import ProfileLayout from '@/components/Layout/profile'
import Section from '@/components/Section'
import { TYPE } from '@/styles/theme'
import { RowCenter } from '@/components/Row'
import { DeckCard } from '@/state/deck/actions'
import DeckInsertionModal from '@/components/DeckInsertionModal'
import {
  useDeckState,
  useSetDeckCards,
  useDeckActionHandlers,
  useDeckDraggingOffset,
  useDeckDraggingStyle,
} from '@/state/deck/hooks'
import { useCurrentUser } from '@/state/user/hooks'
import { useDeckInsertionModalToggle } from '@/state/application/hooks'

const QUERY_USER_SHOWCASED_DECK = gql`
  query ($slug: String!) {
    user(slug: $slug) {
      showcasedDeck {
        deckCards {
          card {
            id
            slug
            serialNumber
            cardModel {
              slug
              pictureUrl(derivative: "width=512")
            }
          }
          cardIndex
        }
      }
    }
  }
`

const SHOWCASED_DECK_MAX_COUNT = 5
const DECK_CARDS_GAP = 32

const ShowcaseSection = styled(Section)`
  border-radius: 4px;
  padding: 42px;
  background: linear-gradient(#372037 0%, #271d3b 100%);
`

const StyledEmptyCard = styled(RowCenter)`
  background: ${({ theme }) => theme.bg3}80;

  ::after {
    content: '';
    padding-bottom: 141%;
  }
`

const CardPicture = styled.img`
  width: 100%;
`

const DragButton = styled.button`
  position: absolute;
  opacity: 0;
  transition: opacity 100ms ease-out;
  cursor: move;
`

const RemoveButton = styled.button`
  position: absolute;
  bottom: 0;
  opacity: 0;
  transition: opacity 100ms ease-out;
  cursor: pointer;
`

const StyledDeckCard = styled.div`
  position: relative;

  &:hover ${DragButton}, &:hover ${RemoveButton} {
    opacity: 1;
  }
`

const DeckGrid = styled.div<{ cols: number; gap: number }>`
  display: grid;
  grid-template-columns: repeat(${({ cols }) => cols}, minmax(0, 1fr));
  justify-content: space-between;
  gap: ${({ gap }) => gap}px;
`

interface EmptyCardProps extends React.HTMLAttributes<HTMLDivElement> {
  onClick?: () => void
}

const EmptyCard = ({ onClick, ...props }: EmptyCardProps) => {
  return (
    <StyledEmptyCard style={onClick ? { cursor: 'pointer' } : {}} onClick={onClick} justify="center" {...props}>
      {onClick && <TYPE.body fontSize={32}>+</TYPE.body>}
    </StyledEmptyCard>
  )
}

function Profile({ userId }: { userId: string }) {
  const router = useRouter()
  const { username } = router.query
  const userSlug = typeof username === 'string' ? username.toLowerCase() : null

  const currentUser = useCurrentUser()
  const isCurrentUserProfile = currentUser?.slug === userSlug

  const toggleDeckInsertionModal = useDeckInsertionModalToggle()

  const deckRef = useRef<HTMLDivElement>(null)
  const draggableNodeRef = useRef<HTMLDivElement>(null)
  const deckCardWidth = useMemo(
    () =>
      deckRef?.current?.offsetWidth
        ? (deckRef?.current?.offsetWidth - DECK_CARDS_GAP * (SHOWCASED_DECK_MAX_COUNT - 1)) / SHOWCASED_DECK_MAX_COUNT
        : 0,
    [deckRef?.current?.offsetWidth]
  )

  const {
    draggedDeckIndex: { initial: draggedInitialIndex },
    deckCards,
  } = useDeckState()
  const setDeckCards = useSetDeckCards()
  const { onDraggingStart, onDragging, onDraggingStop, onRemove } = useDeckActionHandlers()
  const getDeckDraggingOffset = useDeckDraggingOffset(DECK_CARDS_GAP, deckCardWidth)
  const getDeckDraggingStyle = useDeckDraggingStyle()

  const handleDragging = useCallback(
    (event: DraggableEvent, data: DraggableData) => onDragging(event, data, DECK_CARDS_GAP, deckCardWidth),
    [onDragging, deckCardWidth]
  )

  const {
    data: userData,
    loading,
    error,
  } = useQuery(QUERY_USER_SHOWCASED_DECK, { variables: { slug: userSlug }, skip: !userSlug })

  const showcasedDeck = userData?.user?.showcasedDeck

  useEffect(() => {
    setDeckCards(showcasedDeck?.deckCards ?? [])
  }, [showcasedDeck?.deckCards, setDeckCards])

  if (!!error || !!loading) {
    if (!!error) console.error(error)
    return null
  }

  if (!error && !loading && !showcasedDeck) {
    return <TYPE.body>Deck not found</TYPE.body>
  }

  return (
    <>
      <ShowcaseSection>
        <DeckGrid cols={SHOWCASED_DECK_MAX_COUNT} gap={DECK_CARDS_GAP} ref={deckRef}>
          {deckCards.map((deckCard: DeckCard, index: number) => (
            <Draggable
              key={`showcased-deck-card-${index}`}
              nodeRef={draggableNodeRef}
              handle=".dragger"
              position={{ x: getDeckDraggingOffset(index), y: 0 }}
              onStart={onDraggingStart}
              onDrag={handleDragging}
              onStop={onDraggingStop}
            >
              <StyledDeckCard ref={draggableNodeRef} style={getDeckDraggingStyle(index)}>
                {isCurrentUserProfile && (
                  <>
                    <DragButton style={{ cursor: 'move' }} className="dragger" data-index={index}>
                      drag me
                    </DragButton>
                    <RemoveButton onClick={() => onRemove(deckCard.cardIndex)}>delete me</RemoveButton>
                  </>
                )}
                <Link href={`/card/${deckCard.card.cardModel.slug}/${deckCard.card.serialNumber}`}>
                  <CardPicture src={deckCard.card.cardModel.pictureUrl} />
                </Link>
              </StyledDeckCard>
            </Draggable>
          ))}
          {[...Array(SHOWCASED_DECK_MAX_COUNT - deckCards.length)].map((_, index) => (
            <EmptyCard
              key={`showcased-deck-card-${index}`}
              onClick={isCurrentUserProfile ? toggleDeckInsertionModal : undefined}
            />
          ))}
        </DeckGrid>
      </ShowcaseSection>
      {isCurrentUserProfile && <DeckInsertionModal userId={userId} />}
    </>
  )
}

Profile.getLayout = (page: JSX.Element) => {
  return (
    <DefaultLayout>
      <ProfileLayout>{page}</ProfileLayout>
    </DefaultLayout>
  )
}

export default Profile
