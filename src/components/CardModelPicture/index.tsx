import React from 'react'
import styled from 'styled-components'

const StyledImage = styled.img`
  position: absolute;
  height: 100%;
  top: 0;
  left: 0;
  object-fit: contain;
`

interface CardModelVideoProps extends React.HTMLAttributes<HTMLImageElement> {
  src: string
}

export default function CardModelVideo({ src, ...props }: CardModelVideoProps) {
  return <StyledImage src={src} {...props} />
}
