import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import styled from 'styled-components/macro'
import { useSpring, animated } from '@react-spring/web'
import FocusLock from 'react-focus-lock'
import { RemoveScroll } from 'react-remove-scroll'

import { CardDisplaySelector } from './Selector'
import { RowCenter } from 'src/components/Row'
import Card from './Card'
import useWindowSize from 'src/hooks/useWindowSize'
import { CARD_ASPECT_RATIO } from 'src/constants/misc'
import useCardModel3DFullscreen from 'src/hooks/useCardModel3DFullscreen'

import { ReactComponent as Close } from 'src/images/close.svg'

const StyledCardModel3D = styled.div<{ fullscreen: boolean; scarcityName: string }>`
  position: absolute;
  height: 100%;
  top: 0;
  left: 16px;

  & > video {
    height: 100%;
  }

  ${({ fullscreen }) => fullscreen && `z-index: 999999;`}

  ${({ theme }) => theme.media.small`
    position: unset;
  `}

  ${({ theme }) => theme.media.medium`
    left: 60px;
  `}
`

const CardWrapper = styled.div<{ stacked: boolean; fullscreen: boolean; smallWidth?: number }>`
  height: 100%;
  width: fit-content;

  ${({ stacked }) =>
    stacked &&
    `
      transform: scale(0.97) translate(4.8%, 1.3%);
      margin-right: 24px;
    `}

  ${({ theme, stacked, smallWidth }) => theme.media.small`
    ${
      stacked &&
      `
        margin-right: 0;
        height: unset;
      `
    }

    & video {
      ${smallWidth && `width: ${smallWidth}px;`}
    }
  `}
`

const StyledCardDisplaySelector = styled(CardDisplaySelector)`
  position: absolute;
  top: 0;
  left: -64px;

  ${({ theme }) => theme.media.small`
    position: initial;
    flex-direction: row;
    margin: 32px 0 12px;
    justify-content: center;
  `}

  ${({ theme }) => theme.media.medium`
    left: -44px;
  `}
`

const StyledClose = styled(Close)`
  width: 20px;
  height: 20px;
  cursor: pointer;
`

const CardsStack = styled.div<{ $smallHeight?: number }>`
  img {
    position: absolute;
    height: 100%;
  }

  ${({ theme, $smallHeight }) => theme.media.small`
    & img {
      ${$smallHeight && `height: ${$smallHeight}px;`}
    }
  `}
`

const StackImageTop = styled.img`
  border-radius: 4.7% / 3.35%;
  transform: scale(0.97) translate(4.8%, 1.3%);
`

const Veil = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.bg1};
`

const FullscreenBar = styled(RowCenter)`
  justify-content: space-between;
  position: absolute;

  & > div {
    flex-direction: row;
  }
`

interface CardModel3DProps extends React.HTMLAttributes<HTMLDivElement> {
  videoUrl: string
  pictureUrl: string
  backPictureUrl: string
  scarcityName: string
  stacked?: boolean
}

export default function CardModel3D({
  videoUrl,
  pictureUrl,
  backPictureUrl,
  scarcityName,
  stacked = false,
  ...props
}: CardModel3DProps) {
  // hide / reveal
  const [revealed, setRevealed] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)

  const reveal = useCallback(() => setRevealed(true), [])
  const hide = useCallback(() => setRevealed(false), [])

  // fullscreen bar position
  const cardRef = useRef<HTMLDivElement>(null)

  // fullscreen
  const toggleFullscreen = useCallback(() => setFullscreen(!fullscreen), [fullscreen])

  // window size
  const windowSize = useWindowSize()
  const stackHeight = useMemo(() => windowSize.width ?? 0, [windowSize.width])
  const cardWidth = useMemo(() => stackHeight / CARD_ASPECT_RATIO, [stackHeight])

  // spring
  const [styles, api] = useSpring(() => ({ stackOpacity: 1, config: { mass: 3, tension: 500, friction: 50 } }))

  // card callbacks
  const [moving, setMoving] = useState(false)
  const onRest = useCallback(() => setMoving(false), [])
  const onStart = useCallback(() => setMoving(true), [])

  useEffect(() => {
    console.log(moving, revealed, fullscreen)
    api({
      stackOpacity: +(!moving && revealed && !fullscreen),
      immediate: true,
    })
  }, [moving])

  // on fullscreen
  const { translation, scale, cardRect } = useCardModel3DFullscreen(fullscreen, cardRef?.current, {
    maxScale: 1.75,
    margin: [64, 32],
  })

  return (
    <StyledCardModel3D fullscreen={fullscreen} scarcityName={scarcityName} {...props}>
      {stacked && (
        <CardsStack $smallHeight={stackHeight} as={animated.div} style={{ opacity: styles.stackOpacity }}>
          <img src={`/assets/${scarcityName.toLowerCase()}-stack.png`} />
          <StackImageTop src={pictureUrl} />
        </CardsStack>
      )}

      {fullscreen && (
        <FocusLock>
          <RemoveScroll>
            <Veil>
              {cardRect && (
                <FullscreenBar
                  style={{
                    width: `${cardRect.width - 16}px`,
                    left: `${cardRect.x + 8}px`,
                    top: `${cardRect.y - 48}px`,
                  }}
                >
                  <CardDisplaySelector
                    pictureUrl={pictureUrl}
                    backPictureUrl={backPictureUrl}
                    reveal={reveal}
                    hide={hide}
                    toggleFullscreen={toggleFullscreen}
                  />
                  <StyledClose onClick={toggleFullscreen} />
                </FullscreenBar>
              )}
            </Veil>
          </RemoveScroll>
        </FocusLock>
      )}

      <CardWrapper stacked={stacked} fullscreen={fullscreen} smallWidth={cardWidth}>
        <Card
          videoUrl={videoUrl}
          pictureUrl={pictureUrl}
          scarcityName={scarcityName}
          transform={{
            rz: stacked && !fullscreen ? 3 : 0,
            tx: translation.tx,
            ty: translation.ty,
            scale,
          }}
          revealed={revealed}
          onStart={onStart}
          onRest={onRest}
          cardRef={cardRef}
        />
      </CardWrapper>

      {!fullscreen && (
        <StyledCardDisplaySelector
          pictureUrl={pictureUrl}
          backPictureUrl={backPictureUrl}
          reveal={reveal}
          hide={hide}
          toggleFullscreen={toggleFullscreen}
        />
      )}
    </StyledCardModel3D>
  )
}
