import React, { useState } from 'react'

import Box, { BoxProps } from './Box'

const Image = React.forwardRef(
  ({ loading, src, onLoad, ...props }: BoxProps, ref: React.ForwardedRef<HTMLImageElement>) => {
    const [loaded, setLoaded] = useState(false)

    return (
      <Box
        as={src ? 'img' : 'div'}
        ref={ref}
        src={src}
        loading={loading !== undefined ? loading : !loaded}
        onLoad={(e) => {
          if (onLoad) onLoad(e)
          setLoaded(true)
        }}
        {...props}
      />
    )
  }
)

Image.displayName = 'Image'

export default Image
