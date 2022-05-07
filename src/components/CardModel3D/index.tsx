import React, { useState, useCallback } from 'react'
import styled, { css } from 'styled-components'

import CardDisplaySelector from '@/components/CardDisplaySelector'

const StyledCardDisplaySelector = styled(CardDisplaySelector)`
  position: absolute;
  top: 0;
  left: -64px;

  ${({ theme }) => theme.media.small`
    position: initial;
    flex-direction: row;
    margin-bottom: 12px;
  `}

  ${({ theme }) => theme.media.medium`
    left: 16px;
  `}
`

const FrameStyle = css`
  position: absolute;
  height: 100%;
  top: 0;
  left: 0;
  object-fit: contain;
  left: 16px;

  ${({ theme }) => theme.media.small`
    position: initial;
    width: 100%;
    max-width: 500px; /* Safari height bug */
  `}

  ${({ theme }) => theme.media.medium`
    left: 96px;
  `}
`

const StyledVideo = styled.video`
  ${FrameStyle}
`

const StyledImage = styled.img`
  ${FrameStyle}
`

interface CardModel3DProps {
  videoUrl: string
  pictureUrl: string
  backPictureUrl: string
}

export default function CardModel3D({ videoUrl, pictureUrl, backPictureUrl }: CardModel3DProps) {
  const [cardModelDisplayMode, setCardModelDisplayMode] = useState<'front' | 'back' | 'spin'>('front')
  const onBackSelected = useCallback(() => setCardModelDisplayMode('back'), [setCardModelDisplayMode])
  const onFrontSelected = useCallback(() => setCardModelDisplayMode('front'), [setCardModelDisplayMode])

  return (
    <>
      <StyledVideo
        src={videoUrl}
        style={{ display: cardModelDisplayMode === 'front' ? 'initial' : 'none' }}
        playsinline
        loop
        autoPlay
        muted
      />
      <StyledImage src={backPictureUrl} style={{ display: cardModelDisplayMode === 'back' ? 'initial' : 'none' }} />
      <StyledCardDisplaySelector
        pictureUrl={pictureUrl}
        backPictureUrl={backPictureUrl}
        onBackSelected={onBackSelected}
        onFrontSelected={onFrontSelected}
      />
    </>
  )
}
