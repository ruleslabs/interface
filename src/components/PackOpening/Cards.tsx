import React, { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { ScarcityName } from '@rulesorg/sdk-core'
import { useSpring, animated } from 'react-spring'

import useCardsBackPictureUrl from '@/hooks/useCardsBackPictureUrl'
import CardModelBreakdown from '@/components/CardModelBreakdown'
import Card from '@/components/Card'
import { useAudioLoop } from '@/state/packOpening/hooks'
import { Sound } from '@/state/packOpening/actions'
import Row from '@/components/Row'

import Close from '@/images/close.svg'

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

const CardTranslator = styled.div`
  width: fit-content;
  cursor: pointer;
  width: 256px;
  perspective: 1000px;
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

const CardImage = ({ cards, revealedCardIndex, cardIndexToLoad, focused }: CardImageProps) => {
  // get back picture
  const backPictureUrl = useCardsBackPictureUrl(512)

  // react spring
  const [styles, api] = useSpring(() => ({
    rotation: [0, 0],
    glare: [50, 50, 0],
    config: { mass: 5, tension: 200, friction: 30 },
  }))

  // onMouseMove
  const onMouseMove = useCallback(
    (event) => {
      const targetRect = event.currentTarget.getBoundingClientRect()

      if (!targetRect.height || !targetRect.width) return

      // mouse position
      const relativeMousePosition = {
        x: event.clientX - Math.floor(targetRect.x),
        y: event.clientY - Math.floor(targetRect.y),
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

  // onMouseLeave
  const onMouseLeave = useCallback(() => api({ rotation: [0, 0], glare: [50, 50, 0] }), [api])

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
    <CardTranslator
      position={cardIndexToLoad === 0 ? 'left' : cardIndexToLoad === 1 ? 'center' : 'right'}
      focused={focused}
    >
      <CardRotator
        as={animated.div}
        style={{ transform: styles.rotation.to(rotationInterpolation) }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
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
              artistUsername={focusedCard.cardModel.artist.user?.username}
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
