import React, { useState, useCallback, useMemo } from 'react'
import styled, { css } from 'styled-components'

import { CardDisplaySelector, CardFullscreenSelector } from '@/components/CardSelector'
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
      padding-right: 24px;
  `}

  ${({ theme, stacked, smallWidth }) =>
    stacked &&
    theme.media.small`
    padding-right: 0;
    height: unset;

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

  ${({ theme }) => theme.media.small`
    position: initial;
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
  rotatingVideoUrl: string
  backPictureUrl: string
  scarcityName: string
  stacked?: boolean
}

export default function CardModel3D({
  videoUrl,
  rotatingVideoUrl,
  pictureUrl,
  backPictureUrl,
  scarcityName,
  stacked = false,
  ...props
}: CardModel3DProps) {
  const [cardModelDisplayMode, setCardModelDisplayMode] = useState<'front' | 'back' | 'rotate'>('front')
  const [fullscreen, setFullscreen] = useState(false)

  const onBackSelected = useCallback(() => setCardModelDisplayMode('back'), [setCardModelDisplayMode])
  const onFrontSelected = useCallback(() => setCardModelDisplayMode('front'), [setCardModelDisplayMode])
  const onRotateSelected = useCallback(() => setCardModelDisplayMode('rotate'), [setCardModelDisplayMode])

  const toggleFullscreen = useCallback(() => setFullscreen(!fullscreen), [setFullscreen, fullscreen])

  stacked = stacked && !fullscreen && cardModelDisplayMode === 'front'

  // window size
  const windowSize = useWindowSize()
  const cardWidth = useMemo(() => (windowSize.width ?? 0) * 0.72, [windowSize.width])
  const stackHeight = useMemo(() => cardWidth * 1.39, [cardWidth])

  return (
    <CardVisualsWrapper fullscreen={fullscreen} scarcityName={scarcityName} {...props}>
      {stacked && (
        <CardsStack smallHeight={stackHeight}>
          <img src={`/assets/${scarcityName.toLowerCase()}-stack.png`} />
          <StackImageTop src={pictureUrl} />
        </CardsStack>
      )}
      {fullscreen && <StyledClose onClick={toggleFullscreen} />}

      <CardWrapper stacked={stacked} smallWidth={cardWidth}>
        <Card scarcityName={scarcityName} videoUrl={videoUrl} revealed />
      </CardWrapper>

      <video
        src={rotatingVideoUrl}
        style={{ display: cardModelDisplayMode === 'rotate' ? 'initial' : 'none' }}
        playsInline
        loop
        autoPlay
        muted
      />
      <StyledCardDisplaySelector
        pictureUrl={pictureUrl}
        backPictureUrl={backPictureUrl}
        onBackSelected={onBackSelected}
        onFrontSelected={onFrontSelected}
        onRotateSelected={onRotateSelected}
      />
      {!fullscreen && <StyledCardFullscreenSelector toggleFullscreen={toggleFullscreen} />}
    </CardVisualsWrapper>
  )
}
