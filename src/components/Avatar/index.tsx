import React, { useCallback, useEffect, useState } from 'react'
import { BoxProps } from 'src/theme/components/Box'
import Image from 'src/theme/components/Image'

interface AvatarProps extends BoxProps {
  fallbackSrc: string
  src: string
}

export default function Avatar({ fallbackSrc, src, ...props }: AvatarProps) {
  const [defaultSrc, setDefaultSrc] = useState(src)
  const onFallback = useCallback(() => setDefaultSrc(fallbackSrc), [fallbackSrc])

  useEffect(() => {
    setDefaultSrc(src)
  }, [src])

  return <Image src={defaultSrc} {...props} onError={onFallback} borderRadius="round" />
}
