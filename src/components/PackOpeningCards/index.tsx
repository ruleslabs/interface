import React, { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { ScarcityName } from '@rulesorg/sdk-core'

import useCardsBackPictureUrl from '@/hooks/useCardsBackPictureUrl'
import CardModelBreakdown from '@/components/CardModelBreakdown'
import Card from '@/components/Card'

import Close from '@/images/close.svg'

const CARD_WIDTH = 256
const CARD_RATIO = 1.39

const StyledPackOpeningCards = styled.div`
  position: relative;
  width: 100%;
  max-width: 1024px;

  img {
    width: ${CARD_WIDTH}px;
  }

  & > div:last-child {
  }
`

const FocusedVeil = styled.div<{ active: boolean }>`
  z-index: 99;
  background: #000;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  transition: opacity ${({ active }) => (active ? 100 : 600)}ms ease,
    ${({ active }) => (active ? '' : 'visibility 0s linear 100ms')};
  opacity: ${({ active }) => (active ? '1' : '0')};
  visibility: ${({ active }) => (active ? 'visible' : 'hidden')};
`

const StyledCardImage = styled.div<{ position: 'left' | 'center' | 'right'; focused: boolean }>`
  cursor: pointer;
  position: absolute;
  top: 0;
  left: ${({ position }) =>
    position === 'right'
      ? `calc(100% - ${CARD_WIDTH}px)`
      : position === 'left'
      ? '0'
      : `calc(50% - ${CARD_WIDTH / 2}px)`};
  width: ${CARD_WIDTH}px;
  height: ${CARD_RATIO * CARD_WIDTH}px;
  overflow: visible;
  z-index: 1;
  perspective: 1000px;
  transition: left 100ms ease, transform 100ms ease, z-index 0s linear 100ms;

  ${({ focused }) =>
    focused &&
    `
      left: calc(50% - ${CARD_WIDTH * 1.5}px);
      z-index: 999;
      transform: scale(2);
      transition: left 600ms ease, transform 600ms ease;
    `}

  img,
  video {
    display: block;
    transition: transform 100ms ease;
  }

  span {
    transition: transform 100ms ease, box-shadow 600ms ease;
  }

  :hover {
    ${({ focused }) => !focused && 'transform: scale(1.3);'}
  }
`

const FlipCardWrapper = styled.div<{ scarcity: string; revealed: boolean }>`
  transition: transform 600ms ease;
  transform-style: preserve-3d;
  ${({ revealed }) => revealed && 'transform: rotateY(180deg);'}

  & > div {
    position: absolute;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;

    span {
      border-radius: 12px;
      box-shadow: 0 0 32px ${({ theme, scarcity }) => (scarcity === 'Platinium' ? theme.platinium : theme.primary1)};
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: -1;
    }
  }

  & > div:last-child {
    transform: rotateY(180deg);
  }
`

const CardVideo = styled.video`
  width: 100%;
`

const CardModelBreakdownWrapper = styled(Card)`
  position: absolute;
  left: calc(50% + ${CARD_WIDTH / 2}px);
  top: 406px;
  width: 300px;
`

const StyledClose = styled(Close)`
  position: absolute;
  width: 20px;
  height: 20px;
  cursor: pointer;
  top: 178px;
  left: calc(50% + ${CARD_WIDTH / 2 + 300 - 20}px);
`

interface CardImageProps {
  cards: any[]
  revealedCardIndex?: number
  cardIndexToLoad: number
  onClick: () => void
  focused: boolean
}

const CardImage = ({ cards, revealedCardIndex, onClick, cardIndexToLoad, focused }: CardImageProps) => {
  const backPictureUrl = useCardsBackPictureUrl(512)

  return (
    <StyledCardImage
      onClick={onClick}
      position={cardIndexToLoad === 0 ? 'left' : cardIndexToLoad === 1 ? 'center' : 'right'}
      focused={focused}
    >
      <FlipCardWrapper
        revealed={revealedCardIndex !== undefined}
        scarcity={revealedCardIndex !== undefined ? cards[revealedCardIndex].cardModel.scarcity.name : ScarcityName[0]}
      >
        <div>
          <img src={backPictureUrl} alt="card-back" />
          <span />
        </div>
        <div>
          <CardVideo
            src={cards[revealedCardIndex === undefined ? cardIndexToLoad : revealedCardIndex].cardModel.videoUrl}
            playsInline
            loop
            autoPlay
            muted
          />
          <span />
        </div>
      </FlipCardWrapper>
    </StyledCardImage>
  )
}

interface PackOpeningCardsProps extends React.HTMLAttributes<HTMLDivElement> {
  cards: any[]
}

export default function PackOpeningCards({ cards, ...props }: PackOpeningCardsProps) {
  const [revealedCardIndexes, setRevealedCardIndexes] = useState<{ [index: number]: number }>({})
  const [focusedCard, setFocusedCard] = useState<any | null>(null)

  const sortedCardsByScarcity = useMemo(
    () =>
      cards.sort(
        (a, b) => ScarcityName.indexOf(a.cardModel.scarcity.name) - ScarcityName.indexOf(b.cardModel.scarcity.name)
      ),
    [cards.length]
  )

  const handleReveal = useCallback(
    (cardIndex: number): number => {
      const revealedCardIndex = Object.keys(revealedCardIndexes).length

      setRevealedCardIndexes({ ...revealedCardIndexes, [cardIndex]: revealedCardIndex })
      return revealedCardIndex
    },
    [sortedCardsByScarcity, revealedCardIndexes, setRevealedCardIndexes]
  )

  const handleCardFocus = useCallback(
    (cardIndex: number) => {
      if (revealedCardIndexes[cardIndex] === undefined) {
        const revealedCardIndex = handleReveal(cardIndex)
        setFocusedCard(sortedCardsByScarcity[revealedCardIndex])
      } else setFocusedCard(sortedCardsByScarcity[revealedCardIndexes[cardIndex]])
    },
    [sortedCardsByScarcity, revealedCardIndexes, setRevealedCardIndexes, setFocusedCard]
  )

  const resetFocus = useCallback(() => {
    setFocusedCard(null)
  }, [setFocusedCard])

  return (
    <>
      <StyledPackOpeningCards {...props}>
        {Array(3)
          .fill(0)
          .map((_, index: number) => (
            <CardImage
              key={`card-image-${index}`}
              cards={sortedCardsByScarcity}
              cardIndexToLoad={index}
              revealedCardIndex={revealedCardIndexes[index]}
              onClick={() => handleCardFocus(index)}
              focused={
                revealedCardIndexes[index] !== undefined &&
                focusedCard?.slug === sortedCardsByScarcity[revealedCardIndexes[index]]?.slug
              }
            />
          ))}
      </StyledPackOpeningCards>
      <FocusedVeil onClick={resetFocus} active={!!focusedCard}>
        <CardModelBreakdownWrapper>
          {!!focusedCard && (
            <CardModelBreakdown
              artistName={focusedCard.cardModel.artist.displayName}
              artistUsername={focusedCard.cardModel.artist.user.username}
              artistUserSlug={focusedCard.cardModel.artist.user.slug}
              season={focusedCard.cardModel.season}
              scarcity={focusedCard.cardModel.scarcity.name}
              maxSupply={focusedCard.cardModel.scarcity.maxSupply}
              serial={focusedCard.serialNumber}
            />
          )}
        </CardModelBreakdownWrapper>
        <StyledClose onClick={resetFocus} />
      </FocusedVeil>
    </>
  )
}
