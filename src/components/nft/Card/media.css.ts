import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

import { breakpoints, sprinkles } from 'src/theme/css/sprinkles.css'
import { vars } from 'src/theme/css/vars.css'
import { container, mediaContainer } from './style.css'

const mediaScaleOnHover = style({
  transition: `${vars.time.medium} ${vars.timing.ease} transform`,
  selectors: {
    [`${container().split(' ')[0]}:hover &`]: {
      transform: 'scale(1.15)',
    },
  },
})

export const image = recipe({
  base: style([
    mediaScaleOnHover,
    sprinkles({
      width: 'full',
      objectFit: 'contain',
    }),
  ]),

  variants: {
    hidden: {
      true: sprinkles({ visibility: 'hidden' }),
    },
  },

  defaultVariants: {
    hidden: false,
  },
})

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
        [`${mediaContainer.split(' ')[0]}:hover &`]: {
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
  mediaScaleOnHover,
  sprinkles({
    width: 'full',
  }),
])

export const innerMediaContainer = sprinkles({
  position: 'absolute',
  left: '0',
  top: '0',
})
