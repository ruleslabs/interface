import React, { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { ScarcityName } from '@rulesorg/sdk-core'

import useCardsBackPictureUrl from '@/hooks/useCardsBackPictureUrl'
import { RowCenter } from '@/components/Row'

const StyledPackOpeningCards = styled(RowCenter)`
  gap: 128px;
  justify-content: center;

  img {
    width: 256px;
  }
`

const StyledCardImage = styled.div`
  cursor: pointer;
  position: relative;
  width: 256px;
  overflow: visible;
  z-index: 1;
  perspective: 1000px;

  img,
  video {
    display: block;
    transition: transform 100ms ease;
  }

  span {
    transition: transform 100ms ease, box-shadow 600ms ease;
  }

  :hover img,
  :hover video,
  :hover span {
    transform: scale(1.3);
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

interface CardImageProps {
  cards: any[]
  revealedCardIndex?: number
  cardIndexToLoad: number
  onReveal: () => void
}

const CardImage = ({ cards, revealedCardIndex, onReveal, cardIndexToLoad }: CardImageProps) => {
  const backPictureUrl = useCardsBackPictureUrl(512)

  console.log(revealedCardIndex !== undefined ? cards[revealedCardIndex].cardModel.scarcity.name : ScarcityName[0])

  return (
    <StyledCardImage onClick={revealedCardIndex === undefined ? onReveal : undefined}>
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

  const sortedCardsByScarcity = useMemo(
    () =>
      cards.sort(
        (a, b) => ScarcityName.indexOf(a.cardModel.scarcity.name) - ScarcityName.indexOf(b.cardModel.scarcity.name)
      ),
    [cards.length]
  )

  const handleReveal = useCallback(
    (cardIndex: number) => {
      setRevealedCardIndexes({
        ...revealedCardIndexes,
        [cardIndex]: Object.keys(revealedCardIndexes).length,
      })
    },
    [sortedCardsByScarcity, revealedCardIndexes, setRevealedCardIndexes]
  )

  return (
    <StyledPackOpeningCards {...props}>
      {Array(3)
        .fill(0)
        .map((_, index: number) => (
          <CardImage
            key={`card-image-${index}`}
            cards={sortedCardsByScarcity}
            cardIndexToLoad={index}
            revealedCardIndex={revealedCardIndexes[index]}
            onReveal={() => handleReveal(index)}
          />
        ))}
    </StyledPackOpeningCards>
  )
}
