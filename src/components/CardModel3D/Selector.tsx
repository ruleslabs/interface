import React from 'react'
import styled from 'styled-components/macro'

import Column from 'src/components/Column'
import { RowCenter } from 'src/components/Row'

import { ReactComponent as Expand } from 'src/images/expand.svg'

const StyledCardDisplaySelector = styled(Column)`
  gap: 12px;

  div {
    border-radius: 6px;
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
  reveal: () => void
  hide: () => void
  toggleFullscreen: () => void
}

export function CardDisplaySelector({
  pictureUrl,
  backPictureUrl,
  reveal,
  hide,
  toggleFullscreen,
  ...props
}: CardDisplaySelectorProps) {
  return (
    <StyledCardDisplaySelector {...props}>
      <div onClick={reveal}>
        <img src={pictureUrl} />
      </div>

      <div onClick={hide}>
        <img src={backPictureUrl} />
      </div>

      <RowCenter onClick={toggleFullscreen} justify="center">
        <Expand />
      </RowCenter>
    </StyledCardDisplaySelector>
  )
}
