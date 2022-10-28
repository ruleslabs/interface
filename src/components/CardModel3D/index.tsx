import React, { useState, useCallback, useMemo } from 'react'
import styled, { css } from 'styled-components'
import { useSpring, animated } from 'react-spring'

import { CardDisplaySelector, CardFullscreenSelector } from './Selector'
import Card from './Card'
import useWindowSize from '@/hooks/useWindowSize'

import Close from '@/images/close.svg'

const CardWrapper = styled.div<{ stacked: boolean; smallWidth?: number }>`
  height: 100%;
  width: fit-content;

  ${({ stacked }) =>
    stacked &&
    `
      transform: scale(0.97) translate(4.3%,1.5%) rotate(3deg);
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

const FullscreenCardVisualWrapperStyle = css<{ scarcityName: string }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000;
  z-index: 9999;
  display: flex;
  flex-direction: row-reverse;
  justify-content: center;
  gap: 32px;
  padding: 64px 0;

  img,
  video {
    position: initial;
    height: 100%;
  }

  & > div {
    position: initial;
    top: unset;
    left: unset;
  }
`

const CardVisualsWrapper = styled.div<{ fullscreen: boolean; scarcityName: string }>`
  ${({ fullscreen }) => (fullscreen ? FullscreenCardVisualWrapperStyle : DefaultCardVisualWrapperStyle)}
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

const StyledCardFullscreenSelector = styled(CardFullscreenSelector)`
  position: absolute;
  top: 0;
  right: -44px;

  ${({ theme }) => theme.media.medium`
    left: -44px;
    bottom: 0;
    top: unset;
    right: unset;
  `}

  ${({ theme }) => theme.media.small`
    display: none;
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
  const [revealed, setRevealed] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)

  const reveal = useCallback(() => setRevealed(true), [])
  const hide = useCallback(() => setRevealed(false), [])

  const toggleFullscreen = useCallback(() => setFullscreen(!fullscreen), [fullscreen])

  stacked = stacked && !fullscreen

  // window size
  const windowSize = useWindowSize()
  const cardWidth = useMemo(() => (windowSize.width ?? 0) * 0.72, [windowSize.width])
  const stackHeight = useMemo(() => cardWidth * 1.39, [cardWidth])

  // spring
  const [styles, api] = useSpring(() => ({ stackOpacity: 1, config: { mass: 3, tension: 500, friction: 50 } }))

  // card callbacks
  const onRest = useCallback(() => api({ stackOpacity: +revealed }), [api, revealed])
  const onStart = useCallback(() => api({ stackOpacity: 0 }), [api])

  return (
    <CardVisualsWrapper fullscreen={fullscreen} scarcityName={scarcityName} {...props}>
      {stacked && (
        <CardsStack smallHeight={stackHeight} as={animated.div} style={{ opacity: styles.stackOpacity }}>
          <img src={`/assets/${scarcityName.toLowerCase()}-stack.png`} />
          <StackImageTop src={pictureUrl} />
        </CardsStack>
      )}
      {fullscreen && <StyledClose onClick={toggleFullscreen} />}

      <CardWrapper stacked={stacked} smallWidth={cardWidth}>
        <Card scarcityName={scarcityName} videoUrl={videoUrl} revealed={revealed} onStart={onStart} onRest={onRest} />
      </CardWrapper>

      <StyledCardDisplaySelector pictureUrl={pictureUrl} backPictureUrl={backPictureUrl} reveal={reveal} hide={hide} />

      {!fullscreen && <StyledCardFullscreenSelector toggleFullscreen={toggleFullscreen} />}
    </CardVisualsWrapper>
  )
}
