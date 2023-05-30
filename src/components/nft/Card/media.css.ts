import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

import { breakpoints, sprinkles } from 'src/theme/css/sprinkles.css'
import { mediaContainer } from './style.css'

export const image = style([
  {
    aspectRatio: '1074 / 1500',
  },
  sprinkles({
    width: 'full',
    objectFit: 'contain',
    borderRadius: 'card',
    overflow: 'hidden',
  }),
])

// playable media

export const playbackButton = recipe({
  base: [
    {
      pointerEvents: 'auto',
      boxSizing: 'content-box',

      '@media': {
        [`screen and (max-width: ${breakpoints.sm}px)`]: {
          display: 'flex',
        },
      },

      selectors: {
        [`${mediaContainer().split(' ')[0]}:hover &`]: {
          display: 'flex',
        },
      },
    },
    sprinkles({
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: 'text1',
      position: 'absolute',
      height: '20',
      width: '20',
      padding: '12',
      zIndex: '1',
      bottom: '8',
      right: '8',
      borderRadius: 'classic',
      background: 'bg1Transparent',
    }),
  ],

  variants: {
    pauseButton: {
      true: sprinkles({ display: 'flex' }),
      false: sprinkles({ display: 'none' }),
    },
  },

  defaultVariants: {
    pauseButton: false,
  },
})

export const audio = sprinkles({
  width: 'full',
  height: 'full',
})

export const video = style([
  sprinkles({
    width: 'full',
  }),
])

export const innerMediaContainer = sprinkles({
  position: 'absolute',
  left: '0',
  top: '0',
  borderRadius: 'card',
  overflow: 'hidden',
})
