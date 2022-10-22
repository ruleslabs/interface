import React, { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { ScarcityName } from '@rulesorg/sdk-core'
import { useSpring, animated } from 'react-spring'

import useCardsBackPictureUrl from '@/hooks/useCardsBackPictureUrl'
import { useAudioLoop } from '@/state/packOpening/hooks'
import { Sound } from '@/state/packOpening/actions'
import Row from '@/components/Row'

const CARD_WIDTH = 256
const CARD_RATIO = 1.39

const StyledPackOpeningCards = styled(Row)`
  gap: 64px;
  flex-wrap: wrap;
  justify-content: space-around;
  width: 100%;
  max-width: 1024px;

  img {
    width: 256px;
  }
`

const CardTranslator = styled.div`
  width: fit-content;
  cursor: pointer;
  width: 256px;
  perspective: 1000px;
  touch-action: none;
`

const CardRotator = styled.div<{ scarcity: string; revealed: boolean }>`
  display: block;
  position: relative;
  transform-style: preserve-3d;

  & * {
    border-radius: 4.44% / 3.17%;
  }
`

const CardBackImage = styled.img`
  display: block;
  position: absolute;
  z-index: -1;
  width: 100%;
  border-radius: 4.44% / 3.17%;
  transform: rotateY(180deg);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
`

const CardFrontVideo = styled.video`
  display: block;
  width: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
`

const Glare = styled.div`
  transform: translateZ(1px);
  z-index: 2;
  mix-blend-mode: overlay;
  position: absolute;
  top: 0;
  width: 100%;
  bottom: 0;
`

interface CardImageProps {
  cards: any[]
  revealedCardIndex?: number
  cardIndexToLoad: number
  onClick: () => void
  focused: boolean
}

const CardImage = ({ cards, revealedCardIndex, cardIndexToLoad, focused }: CardImageProps) => {
  // get back picture
  const backPictureUrl = useCardsBackPictureUrl(512)

  // react spring
  const [styles, api] = useSpring(() => ({
    rotation: [0, 0],
    glare: [50, 50, 0],
    config: { mass: 5, tension: 200, friction: 30 },
  }))

  // onPointerMove
  const onPointerMove = useCallback(
    (event) => {
      // get targetRect and pointer position
      const targetRect = event.currentTarget.getBoundingClientRect()
      const pointerPosition = {
        x: event.clientX ?? event.touches?.[0]?.clientX,
        y: event.clientY ?? event.touches?.[0]?.clientY,
      }

      if (!targetRect.height || !targetRect.width || !pointerPosition.x || !pointerPosition.y) return

      // mouse position
      const relativeMousePosition = {
        x: pointerPosition.x - Math.floor(targetRect.x),
        y: pointerPosition.y - Math.floor(targetRect.y),
      }
      const percentCenterPosition = {
        x: Math.round((100 * relativeMousePosition.x) / targetRect.width - 50),
        y: Math.round((100 * relativeMousePosition.y) / targetRect.height - 50),
      }

      // rotation
      const rotation = [percentCenterPosition.y / 2, percentCenterPosition.x / -3.5]

      // glare
      const glare = [percentCenterPosition.x + 50, percentCenterPosition.y + 50, 1]

      api({ rotation, glare })
    },
    [api]
  )

  // onPointerLeave
  const onPointerLeave = useCallback(() => api({ rotation: [0, 0], glare: [50, 50, 0] }), [api])

  // interpolations
  const rotationInterpolation = useCallback(
    (rx, ry) => `
      rotateX(${rx}deg)
      rotateY(${ry}deg)
    `,
    []
  )
  const glarePositionInterpolation = useCallback(
    (mx, my) => `
      radial-gradient(
        farthest-corner circle at ${mx}% ${my}%,
        rgba(255, 255, 255, 0.8) 10%,
        rgba(255, 255, 255, 0.65) 20%,
        rgba(0, 0, 0, 0.5) 90%
      )
    `,
    []
  )
  const glareOpacityInterpolation = useCallback((_mx, _my, opacity) => opacity, [])

  return (
    <CardTranslator>
      <CardRotator
        as={animated.div}
        style={{ transform: styles.rotation.to(rotationInterpolation) }}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onTouchMove={onPointerMove}
        revealed={revealedCardIndex !== undefined}
        scarcity={revealedCardIndex !== undefined ? cards[revealedCardIndex].cardModel.scarcity.name : ScarcityName[0]}
      >
        <CardBackImage src={backPictureUrl} alt="card-back" />
        <CardFrontVideo
          src={cards[revealedCardIndex === undefined ? cardIndexToLoad : revealedCardIndex].cardModel.videoUrl}
          playsInline
          loop
          autoPlay
          muted
        />
        <Glare
          as={animated.div}
          style={{
            background: styles.glare.to(glarePositionInterpolation),
            opacity: styles.glare.to(glareOpacityInterpolation),
          }}
        />
      </CardRotator>
    </CardTranslator>
  )
}

interface PackOpeningCardsProps extends React.HTMLAttributes<HTMLDivElement> {
  cards: any[]
}

export default function PackOpeningCards({ cards, ...props }: PackOpeningCardsProps) {
  const [revealedCardIndexes, setRevealedCardIndexes] = useState<{ [index: number]: number }>({})
  const [focusedCard, setFocusedCard] = useState<any | null>(null)

  // sound
  const { fx, loop } = useAudioLoop()

  // sort
  const sortedCardsByScarcity = useMemo(
    () =>
      cards.sort(
        (a, b) => ScarcityName.indexOf(a.cardModel.scarcity.name) - ScarcityName.indexOf(b.cardModel.scarcity.name)
      ),
    [cards]
  )

  const handleReveal = useCallback(
    (cardIndex: number): number => {
      const revealedCardIndex = Object.keys(revealedCardIndexes).length

      switch (sortedCardsByScarcity[revealedCardIndex].cardModel.scarcity.name) {
        case 'Common':
          loop(Sound.COMMON_FOCUS)
          fx(Sound.FX_COMMON)
          break

        case 'Platinium':
          loop(Sound.PLATINIUM_FOCUS)
          fx(Sound.FX_PLATINIUM)
          break
      }

      setRevealedCardIndexes({ ...revealedCardIndexes, [cardIndex]: revealedCardIndex })
      return revealedCardIndex
    },
    [sortedCardsByScarcity, revealedCardIndexes, setRevealedCardIndexes, fx, loop]
  )

  const handleCardFocus = useCallback(
    (cardIndex: number) => {
      if (revealedCardIndexes[cardIndex] === undefined) {
        const revealedCardIndex = handleReveal(cardIndex)
        setFocusedCard(sortedCardsByScarcity[revealedCardIndex])
      } else setFocusedCard(sortedCardsByScarcity[revealedCardIndexes[cardIndex]])
    },
    [sortedCardsByScarcity, revealedCardIndexes, setRevealedCardIndexes, setFocusedCard, handleReveal]
  )

  const resetFocus = useCallback(() => setFocusedCard(null), [setFocusedCard])

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
            onClick={() => handleCardFocus(index)}
            focused={
              revealedCardIndexes[index] !== undefined &&
              focusedCard?.slug === sortedCardsByScarcity[revealedCardIndexes[index]]?.slug
            }
          />
        ))}
    </StyledPackOpeningCards>
  )
}
