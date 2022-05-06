import React from 'react'
import styled from 'styled-components'

const StyledVideo = styled.video`
  position: absolute;
  height: 100%;
  top: 0;
  left: 0;
  object-fit: contain;
`

const CardModelImageShadow = styled.img<{ rotation?: number; left?: number; bottom?: number; opacity?: number }>`
  height: 100%;
  position: absolute;
  transform: rotate(${({ rotation = 0 }) => rotation}deg);
  transform-origin: bottom left;
  opacity: ${({ opacity = 1 }) => opacity};
  z-index: -1;
  left: ${({ left = 0 }) => left}px;
  bottom: ${({ bottom = 0 }) => bottom}px;
`

interface CardModelVideoProps extends React.HTMLAttributes<HTMLVideoElement> {
  src: string
  shadowImageSrc?: string
}

export default function CardModelVideo({ src, shadowImageSrc, ...props }: CardModelVideoProps) {
  return (
    <>
      <StyledVideo src={src} loop autoPlay muted {...props} />
      {shadowImageSrc && (
        <>
          <CardModelImageShadow src={shadowImageSrc} rotation={3} left={8} bottom={5} opacity={0.2} />
          <CardModelImageShadow src={shadowImageSrc} rotation={8} left={4} bottom={15} opacity={0.05} />
        </>
      )}
    </>
  )
}
