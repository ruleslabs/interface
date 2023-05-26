import React, { useEffect, useState, useCallback } from 'react'
import styled from 'styled-components/macro'
import { useQuery, gql } from '@apollo/client'
import { Trans } from '@lingui/macro'

import Link from 'src/components/Link'
import DefaultLayout from 'src/components/Layout'
import ProfileLayout from 'src/components/Layout/Profile'
import Section from 'src/components/Section'
import { TYPE } from 'src/styles/theme'
import { RowCenter } from 'src/components/Row'
import DeckInsertionModal from 'src/components/DeckInsertionModal'
import { useDeckState, useSetDeckCards, useDeckActionHandlers } from 'src/state/deck/hooks'
import { Deck } from 'src/state/deck/actions'
import { useDeckInsertionModalToggle } from 'src/state/application/hooks'
import { SecondaryButton } from 'src/components/Button'
import useSearchedUser from 'src/hooks/useSearchedUser'

const ShowcaseSection = styled(Section)`
  position: relative;
  margin: 80px auto 0;

  ${({ theme }) => theme.media.small`
    margin-top: 32px !important;
  `}

  ${({ theme }) => theme.media.medium`
    margin-top: 64px;
  `}
`

const DeckImage = styled.img`
  width: 100%;
  display: block;
  opacity: 0.7;
`

const StyledEmptyCard = styled(RowCenter)<{ clickable: boolean }>`
  border-radius: 4.7% / 3.35%;
  transition: background 100ms ease;

  ${({ clickable, theme }) =>
    clickable &&
    `
      cursor: pointer;

      &:hover {
        background: ${theme.white}20;
      }
    `}

  &::after {
    content: '';
    padding-bottom: 140%;
  }
`

const CardVideo = styled.video`
  width: 100%;
  border-radius: 4.7% / 3.35%;
  display: block;
`

const RemoveButton = styled(SecondaryButton)`
  z-index: 1;
  position: absolute;
  width: -moz-available;
  left: -2px;
  right: -2px;
  bottom: -2px;
  opacity: 0;
  transition: opacity 100ms ease-out;
  cursor: pointer;
  border-radius: 0 0 10px 10px;
  box-shadow: 0px -4px 4px #00000040;

  ${({ theme }) => theme.media.extraSmall`
    font-size: 12px;
  `}
`

const StyledDeckCard = styled.div`
  position: relative;

  &:hover ${RemoveButton} {
    opacity: 1;
  }
`

const DeckGrid = styled.div`
  display: grid;
  position: absolute;
  left: 16px;
  right: 16px;
`

const DeckGridFirstLine = styled(DeckGrid)`
  top: 6.1%;
  grid-template-columns: 5.4% 26.9% 1fr 26.9% 1fr 26.9% 5.8%;

  #card1 {
    grid-column-start: 2;
    grid-column-end: 3;
  }

  #card2 {
    grid-column-start: 4;
    grid-column-end: 5;
  }

  #card3 {
    grid-column-start: 6;
    grid-column-end: 7;
  }
`

const DeckGridSecondLine = styled(DeckGrid)`
  top: 48.3%;
  grid-template-columns: 20.8% 26.9% 1fr 26.9% 21.3%;

  #card4 {
    grid-column-start: 2;
    grid-column-end: 3;
  }

  #card5 {
    grid-column-start: 4;
    grid-column-end: 5;
  }
`

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
              videoUrl
            }
          }
          cardIndex
        }
      }
    }
  }
`

interface EmptyCardProps extends React.HTMLAttributes<HTMLDivElement> {
  onClick?: () => void
}

const EmptyCard = ({ onClick, ...props }: EmptyCardProps) => {
  return (
    <StyledEmptyCard clickable={!!onClick} onClick={onClick} justify="center" {...props}>
      {onClick && <TYPE.body fontSize={32}>+</TYPE.body>}
    </StyledEmptyCard>
  )
}

interface DeckCardsProps {
  deck: Deck
  indexes: number[]
  onInsertion: (cardIndex: number) => void
  onRemove: (cardIndex: number) => void
  isCurrentUserProfile: boolean
}

const DeckCards = ({ deck, indexes, onInsertion, onRemove, isCurrentUserProfile }: DeckCardsProps) => {
  return (
    <>
      {indexes.map((index: number) =>
        deck[index] ? (
          <StyledDeckCard key={`deck-card-${index}`} id={`card${index}`}>
            {isCurrentUserProfile && (
              <RemoveButton onClick={() => onRemove(index)} large>
                <Trans>Remove from deck</Trans>
              </RemoveButton>
            )}
            <Link href={`/card/${deck[index].cardModel.slug}/${deck[index].serialNumber}`}>
              <CardVideo src={deck[index].cardModel.videoUrl} playsInline loop autoPlay muted />
            </Link>
          </StyledDeckCard>
        ) : (
          <EmptyCard
            id={`card${index}`}
            key={`showcased-deck-card-${index}`}
            onClick={isCurrentUserProfile ? () => onInsertion(index) : undefined}
          />
        )
      )}
    </>
  )
}

function UserProfile() {
  // searched user
  const [user] = useSearchedUser()

  const [cardIndexToInsert, setCardIndexToInsert] = useState(0)
  const toggleDeckInsertionModal = useDeckInsertionModalToggle()
  const toggleDeckInsertionModalForCardIndex = useCallback(
    (cardIndex: number) => {
      setCardIndexToInsert(cardIndex)
      toggleDeckInsertionModal()
    },
    [toggleDeckInsertionModal]
  )

  const { deck } = useDeckState()
  const setDeckCards = useSetDeckCards()
  const { onRemove } = useDeckActionHandlers()

  const {
    data: userData,
    loading,
    error,
  } = useQuery(QUERY_USER_SHOWCASED_DECK, { variables: { slug: user?.slug }, skip: !user?.slug })

  const showcasedDeck = userData?.user?.showcasedDeck

  useEffect(() => {
    setDeckCards(showcasedDeck?.deckCards ?? [])
  }, [showcasedDeck?.deckCards, setDeckCards])

  // TODO: ...
  if (error || loading) {
    if (error) console.error(error)
    return null
  }

  if (!showcasedDeck || !user) {
    return <TYPE.body>Deck not found</TYPE.body>
  }

  return (
    <>
      <ShowcaseSection size="sm">
        <DeckImage src="/assets/deck.png" />
        <DeckGridFirstLine>
          <DeckCards
            indexes={[1, 2, 3]}
            deck={deck}
            onRemove={onRemove}
            onInsertion={toggleDeckInsertionModalForCardIndex}
            isCurrentUserProfile={user.isCurrentUser}
          />
        </DeckGridFirstLine>
        <DeckGridSecondLine>
          <DeckCards
            indexes={[4, 5]}
            deck={deck}
            onRemove={onRemove}
            onInsertion={toggleDeckInsertionModalForCardIndex}
            isCurrentUserProfile={user.isCurrentUser}
          />
        </DeckGridSecondLine>
      </ShowcaseSection>
      {user.isCurrentUser && <DeckInsertionModal address={user.address} cardIndex={cardIndexToInsert} />}
    </>
  )
}

UserProfile.withLayout = () => (
  <DefaultLayout>
    <ProfileLayout>
      <UserProfile />
    </ProfileLayout>
  </DefaultLayout>
)

export default UserProfile
