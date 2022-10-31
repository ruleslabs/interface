import React, { useState, useCallback } from 'react'
import styled from 'styled-components'

import { useAudioLoop } from '@/state/packOpening/hooks'
import { Sound } from '@/state/packOpening/actions'
import Row from '@/components/Row'
import FullscreenableCard from './FullscreenableCard'

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
  // sound
  const { fx, loop, latestLoopSound } = useAudioLoop()

  // fullscreen
  const [fullscreenCardIndex, setFullscreenCardIndex] = useState<number | null>(null)

  // dismiss card fullscreen
  const onDismiss = useCallback(() => setFullscreenCardIndex(null), [])

  // reveal
  const [revealedCardIndexes, setRevealedCardIndexes] = useState<number[]>([])

  const onClick = useCallback(
    (cardIndex: number): number => {
      if (!revealedCardIndexes.includes(cardIndex)) {
        const card = cards[cardIndex]

        switch (card.cardModel.scarcity.name) {
          case 'Common':
          case 'Halloween':
            if (latestLoopSound !== Sound.PLATINIUM_FOCUS) loop(Sound.COMMON_FOCUS)
            fx(Sound.FX_COMMON)
            break

          case 'Platinium':
            loop(Sound.PLATINIUM_FOCUS)
            fx(Sound.FX_PLATINIUM)
            break
        }

        setRevealedCardIndexes([...revealedCardIndexes, cardIndex])
      }
      setFullscreenCardIndex(cardIndex)
    },
    [fx, loop, revealedCardIndexes, latestLoopSound]
  )

  return (
    <StyledPackOpeningCards {...props}>
      {cards.map((card, index: number) => (
        <FullscreenableCard
          key={`card-${index}`}
          onClick={() => onClick(index)}
          videoUrl={card.cardModel.videoUrl}
          serialNumber={card.serialNumber}
          width={256}
          scarcityName={card.cardModel.scarcity.name}
          revealed={revealedCardIndexes.includes(index)}
          fullscreen={fullscreenCardIndex === index}
          onDismiss={onDismiss}
        />
      ))}
    </StyledPackOpeningCards>
  )
}
