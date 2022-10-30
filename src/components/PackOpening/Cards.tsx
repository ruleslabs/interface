import React, { useState, useCallback, useMemo } from 'react'
import { ScarcityName } from '@rulesorg/sdk-core'
import styled from 'styled-components'

import { useAudioLoop } from '@/state/packOpening/hooks'
import { Sound } from '@/state/packOpening/actions'
import Row from '@/components/Row'
import Card from '@/components/CardModel3D/Card'

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
          <Card key={`card-image-${index}`} videoUrl={cards[index].cardModel.videoUrl} width={256} revealed />
        ))}
    </StyledPackOpeningCards>
  )
}
