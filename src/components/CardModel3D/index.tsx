import React, { useState, useCallback, useMemo, useEffect, useLayoutEffect, useRef } from 'react'
import styled, { css } from 'styled-components'
import { useSpring, animated } from 'react-spring'
import FocusLock from 'react-focus-lock'
import { RemoveScroll } from 'react-remove-scroll'

import { CardDisplaySelector } from './Selector'
import { RowCenter } from '@/components/Row'
import Card from './Card'
import useWindowSize from '@/hooks/useWindowSize'
import { CARD_ASPECT_RATIO } from '@/constants/misc'
import { round } from '@/utils/math'

import Close from '@/images/close.svg'

const CardWrapper = styled.div<{ stacked: boolean; fullscreen: boolean; smallWidth?: number }>`
  height: 100%;
  width: fit-content;

  ${({ stacked, fullscreen }) =>
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

const DefaultCardVisualWrapperStyle = css`
  position: absolute;
  height: 100%;
  top: 0;
  left: 16px;

  & > video {
    height: 100%;
  }

  ${({ theme }) => theme.media.small`
    position: unset;
  `}

  ${({ theme }) => theme.media.medium`
    left: 60px;
  `}
`

const CardVisualsWrapper = styled.div<{ fullscreen: boolean; scarcityName: string }>`
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

const CardsStack = styled.div<{ smallHeight?: number }>`
  img {
    position: absolute;
    z-index: -1;
    height: 100%;
  }

  ${({ theme, smallHeight }) => theme.media.small`
    & img {
      ${smallHeight && `height: ${smallHeight}px;`}
    }
  `}
`

const StackImageTop = styled.img`
  border-radius: 4.44% / 3.17%;
  transform: scale(0.97) translate(4.8%, 1.3%);
`

const Focus = styled.div`
  width: 1px;
  height: 0px;
  padding: 0px;
  overflow: hidden;
  position: fixed;
  top: 1px;
  left: 1px;
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

const FULLSCREEN_MARGIN = [64, 32, 64, 32]

const FULLSCREEN_VERTICAL_MARGIN = 16
const FULLSCREEN_HORIZONTAL_MARGIN = 32

const FULLSCREEN_MAXIMUM_SCALE = 1.75

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
    api({ stackOpacity: +(!moving && revealed && !fullscreen) })
  }, [moving])

  // on fullscreen
  const [translation, setTranslation] = useState<any>({})
  const [scale, setScale] = useState(1)
  const [cardRect, setCardRect] = useState<any | null>(null)

  useLayoutEffect(() => {
    if (!fullscreen) {
      setTranslation({ tx: 0, ty: 0 })
      setScale(1)
    } else {
      const targetRect = cardRef?.current?.getBoundingClientRect()
      if (!targetRect) return

      const scaleX = (windowSize.width - FULLSCREEN_MARGIN[1] - FULLSCREEN_MARGIN[3]) / targetRect.width
      const scaleY = (windowSize.height - FULLSCREEN_MARGIN[0] - FULLSCREEN_MARGIN[2]) / targetRect.height

      const offsetX = FULLSCREEN_MARGIN[3] - FULLSCREEN_MARGIN[1]
      const offsetY = FULLSCREEN_MARGIN[2] - FULLSCREEN_MARGIN[0]

      const scale = round(Math.min(scaleX, scaleY, FULLSCREEN_MAXIMUM_SCALE), 3)

      setScale(scale)

      setTranslation({
        tx: round(windowSize.width / 2 - targetRect.x - targetRect.width / 2) + offsetX,
        ty: round(windowSize.height / 2 - targetRect.y - targetRect.height / 2) + offsetY,
      })

      console.log(targetRect.width)

      const width = targetRect.width * scale
      const height = targetRect.height * scale
      const x = windowSize.width / 2 - width / 2
      const y = windowSize.height / 2 - height / 2

      setCardRect({ width, height, x, y })
    }
  }, [fullscreen, windowSize.width, windowSize.height, cardRef?.current?.offsetWidth, cardRef?.current?.offsetHeight])

  return (
    <CardVisualsWrapper fullscreen={fullscreen} scarcityName={scarcityName} {...props}>
      {stacked && (
        <CardsStack smallHeight={stackHeight} as={animated.div} style={{ opacity: styles.stackOpacity }}>
          <img src={`/assets/${scarcityName.toLowerCase()}-stack.png`} />
          <StackImageTop src={pictureUrl} />
        </CardsStack>
      )}

      {fullscreen && (
        <FocusLock>
          <RemoveScroll>
            <Focus>
              <Veil>
                {cardRect && (
                  <FullscreenBar
                    style={{ width: `${cardRect.width}px`, left: `${cardRect.x}px`, top: `${cardRect.y - 48}px` }}
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
            </Focus>
          </RemoveScroll>
        </FocusLock>
      )}

      <CardWrapper stacked={stacked} fullscreen={fullscreen} smallWidth={cardWidth}>
        <Card
          videoUrl={videoUrl}
          fullscreen={fullscreen}
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
    </CardVisualsWrapper>
  )
}
