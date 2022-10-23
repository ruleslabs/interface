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
  z-index: 3;
  mix-blend-mode: overlay;
  position: absolute;
  top: 0;
  width: 100%;
  bottom: 0;
`

const Holo = styled.div`
  transform: translateZ(1px);
  z-index: 2;
  mix-blend-mode: color-dodge;
  position: absolute;
  top: 0;
  width: 100%;
  bottom: 0;
  background-blend-mode: exclusion, hue, hard-light;
  background-size: 50%, 200% 700%, 300%, 200%;
`

const HoloAfter = styled.div`
  position: absolute;
  top: 0;
  width: 100%;
  bottom: 0;
  mix-blend-mode: exclusion;
  background-blend-mode: exclusion, color-burn, hue, hard-light;
  background-size: 50%, 200% 400%, 147%, 200%;
`

const INITIAL_SPRING_VALUES = {
  rotation: [0, 0],
  touch: [50, 50],
  holo: [50, 50, 0],
  opacity: [0],
}

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
    ...INITIAL_SPRING_VALUES,
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
      const percentPosition = {
        x: Math.round((100 * relativeMousePosition.x) / targetRect.width),
        y: Math.round((100 * relativeMousePosition.y) / targetRect.height),
      }
      const percentCenterPosition = {
        x: percentPosition.x - 50,
        y: percentPosition.y - 50,
      }

      // rotation
      const rotation = [percentCenterPosition.y / 2, percentCenterPosition.x / -3.5]

      // touch
      const touch = [percentPosition.x, percentPosition.y]

      // holo ~ 3:2 ratio
      // x = 50 +/- 12.5
      // y = 50 +/- 33.3
      const holo = [
        percentPosition.x / 4 + 37.5,
        percentPosition.y / 3 + 33.3,
        (Math.abs(percentCenterPosition.x) + Math.abs(percentCenterPosition.y)) / 50 -
          Math.abs(percentCenterPosition.x * percentCenterPosition.y) / 4000,
      ]

      api({ rotation, touch, holo, opacity: [1] })
    },
    [api]
  )

  // onPointerLeave
  const onPointerLeave = useCallback(() => api(INITIAL_SPRING_VALUES), [api])

  // interpolations
  // rotation
  const rotationInterpolation = useCallback(
    (rx, ry) => `
      rotateX(${rx}deg)
      rotateY(${ry}deg)
    `,
    []
  )
  // touch
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
  // holo
  const holoBackgroundImageInterpolation = useCallback(
    (mx, my) => `
      url(/assets/illusion.jpg),
      repeating-linear-gradient(
        0deg,
        hsl(0deg, 100%, 70%) 5%,
        hsl(60deg, 100%, 70%) 10%,
        hsl(120deg, 100%, 70%) 15%,
        hsl(180deg, 100%, 70%) 20%,
        hsl(240deg, 100%, 70%) 25%,
        hsl(300deg, 100%, 70%) 30%,
        hsl(360deg, 100%, 70%) 35%
      ),
      repeating-linear-gradient(
        125deg,
        hsl(227deg, 53%, 12%) 0%,
        hsl(180deg, 10%, 60%) 4%,
        hsl(180deg, 29%, 66%) 4.5%,
        hsl(180deg, 10%, 60%) 5%,
        hsl(227deg, 53%, 12%) 10%,
        hsl(227deg, 53%, 12%) 12%
      ),
      radial-gradient(
        farthest-corner circle
        at ${mx}% ${my}%,
        rgba(0, 0, 0, 0.1) 12%,
        rgba(0, 0, 0, 0.15) 20%,
        rgba(0, 0, 0, 0.25) 120%
      )
    `,
    []
  )
  const holoBackgroundInterpolation = useCallback(
    (posx, posy) => `
      center, 0% ${posy}%, ${posx}% ${posy}%
    `,
    []
  )
  const holoFilterInterpolation = useCallback(
    (_posx, _posy, hyp) => `
      brightness(${hyp * 0.3 + 0.4}) contrast(2) saturate(1.5)
    `,
    []
  )
  const holoAfterBackgroundInterpolation = useCallback(
    (posx, posy) => `
      center, 0% ${posy}%, ${-posx}% ${-posy}%
    `,
    []
  )
  const holoAfterFilterInterpolation = useCallback(
    (_posx, _posy, hyp) => `
      brightness(${hyp * 0.5 + 0.7}) contrast(1.6) saturate(1.4)
    `,
    []
  )

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
        <Holo
          as={animated.div}
          style={{
            backgroundImage: styles.touch.to(holoBackgroundImageInterpolation),
            backgroundPosition: styles.holo.to(holoBackgroundInterpolation),
            filter: styles.holo.to(holoFilterInterpolation),
            opacity: styles.opacity,
          }}
        >
          <HoloAfter
            as={animated.div}
            style={{
              backgroundImage: styles.touch.to(holoBackgroundImageInterpolation),
              backgroundPosition: styles.holo.to(holoAfterBackgroundInterpolation),
              filter: styles.holo.to(holoAfterFilterInterpolation),
            }}
          />
        </Holo>
        <Glare
          as={animated.div}
          style={{
            backgroundImage: styles.touch.to(holoBackgroundImageInterpolation),
            background: styles.touch.to(glarePositionInterpolation),
            opacity: styles.opacity,
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
