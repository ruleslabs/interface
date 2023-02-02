import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

const Image = styled.img`
  border-radius: 50%;
`

interface AvatarProps extends React.HTMLAttributes<HTMLImageElement> {
  fallbackSrc: string
  src: string
}

export default function Avatar({ fallbackSrc, src, ...props }: AvatarProps) {
  const [defaultSrc, setDefaultSrc] = useState(src)
  const onFallback = useCallback(() => setDefaultSrc(fallbackSrc), [fallbackSrc])

  return <Image src={defaultSrc} {...props} onError={onFallback} />
}
