import React, { useState, useCallback } from 'react'
import styled, { css } from 'styled-components'

import { CardDisplaySelector, CardFullscreenSelector } from '@/components/CardSelector'

import Close from '@/images/close.svg'

const CardVideoWrapper = styled.div`
  overflow: hidden;
  height: 100%;

  video {
    height: 100%;
  }
`

const DefaultCardVisualWrapperStyle = css`
  position: absolute;
  height: 100%;
  top: 0;
  left: 0;
  left: 16px;

  & > img,
  & > video {
    object-fit: contain;
    height: 100%;
  }

  ${({ theme }) => theme.media.small`
    position: initial;

    img,
    video {
      width: 100%;
      max-width: 500px; /* Safari height bug */
    }
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

  ${CardVideoWrapper} > video {
    transform: scale(1.014, 1.007) translate(-0.1%, 0);
  }

  ${CardVideoWrapper} {
    box-shadow: 0 0 32px
      ${({ theme, scarcityName }) => (scarcityName === 'Platinium' ? theme.platinium : theme.primary1)};
    border-radius: 4%;
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
    margin: 12px 0;
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

interface CardModel3DProps {
  videoUrl: string
  pictureUrl: string
  rotatingVideoUrl: string
  backPictureUrl: string
  scarcityName: string
}

export default function CardModel3D({
  videoUrl,
  rotatingVideoUrl,
  pictureUrl,
  backPictureUrl,
  scarcityName,
}: CardModel3DProps) {
  const [cardModelDisplayMode, setCardModelDisplayMode] = useState<'front' | 'back' | 'rotate'>('front')
  const [fullscreen, setFullscreen] = useState(false)

  const onBackSelected = useCallback(() => setCardModelDisplayMode('back'), [setCardModelDisplayMode])
  const onFrontSelected = useCallback(() => setCardModelDisplayMode('front'), [setCardModelDisplayMode])
  const onRotateSelected = useCallback(() => setCardModelDisplayMode('rotate'), [setCardModelDisplayMode])

  const toggleFullscreen = useCallback(() => setFullscreen(!fullscreen), [setFullscreen, fullscreen])

  return (
    <>
      <CardVisualsWrapper fullscreen={fullscreen} scarcityName={scarcityName}>
        {fullscreen && <StyledClose onClick={toggleFullscreen} />}
        <CardVideoWrapper style={{ display: cardModelDisplayMode === 'front' ? 'initial' : 'none' }}>
          <video src={videoUrl} playsInline loop autoPlay muted />
        </CardVideoWrapper>
        <video
          src={rotatingVideoUrl}
          style={{ display: cardModelDisplayMode === 'rotate' ? 'initial' : 'none' }}
          playsInline
          loop
          autoPlay
          muted
        />
        <img src={backPictureUrl} style={{ display: cardModelDisplayMode === 'back' ? 'initial' : 'none' }} />
        <StyledCardDisplaySelector
          pictureUrl={pictureUrl}
          backPictureUrl={backPictureUrl}
          onBackSelected={onBackSelected}
          onFrontSelected={onFrontSelected}
          onRotateSelected={onRotateSelected}
        />
        {!fullscreen && <StyledCardFullscreenSelector toggleFullscreen={toggleFullscreen} />}
      </CardVisualsWrapper>
    </>
  )
}
