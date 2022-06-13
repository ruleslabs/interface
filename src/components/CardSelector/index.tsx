import React from 'react'
import styled from 'styled-components'

import Column from '@/components/Column'
import { RowCenter } from '@/components/Row'

import Spin from '@/images/spin.svg'
import Expand from '@/images/expand.svg'

const StyledCardDisplaySelector = styled(Column)`
  gap: 12px;

  div {
    border-radius: 3px;
    width: 32px;
    height: 32px;
    background: ${({ theme }) => theme.bg2};
    overflow: hidden;
    cursor: pointer;
  }

  img {
    margin: 8px auto 0;
    display: block;
    width: 22px;
  }
`

interface CardDisplaySelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  pictureUrl: string
  backPictureUrl: string
  onFrontSelected: () => void
  onBackSelected: () => void
  onRotateSelected: () => void
}

export function CardDisplaySelector({
  pictureUrl,
  backPictureUrl,
  onFrontSelected,
  onBackSelected,
  onRotateSelected,
  ...props
}: CardDisplaySelectorProps) {
  return (
    <StyledCardDisplaySelector {...props}>
      <div onClick={onFrontSelected}>
        <img src={pictureUrl} />
      </div>
      <div onClick={onBackSelected}>
        <img src={backPictureUrl} />
      </div>
      <RowCenter onClick={onRotateSelected} justify="center">
        <Spin />
      </RowCenter>
    </StyledCardDisplaySelector>
  )
}

interface CardFullscreenSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  toggleFullscreen: () => void
}

export function CardFullscreenSelector({ toggleFullscreen, ...props }: CardFullscreenSelectorProps) {
  return (
    <StyledCardDisplaySelector {...props}>
      <RowCenter onClick={toggleFullscreen} justify="center">
        <Expand />
      </RowCenter>
    </StyledCardDisplaySelector>
  )
}
