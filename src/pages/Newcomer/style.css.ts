import { style } from '@vanilla-extract/css'
import { sprinkles } from 'src/theme/css/sprinkles.css'
import { vars } from 'src/theme/css/vars.css'

export const sectionContainer = sprinkles({
  justifyContent: 'center',
  padding: '16',
  maxWidth: '1242',
  marginX: 'auto',
})

export const contentContainer = style([
  {
    maxHeight: '850px',
  },
  sprinkles({
    justifyContent: 'space-around',
    height: 'full',
  }),
])

export const logoContainer = style([
  {
    width: '80%',
  },
  sprinkles({
    color: 'text1',
    marginX: 'auto',
    maxWidth: '440',
  }),
])

export const carouselContainer = style([
  {
    selectors: {
      '&::after, &::before': {
        content: '',
        position: 'absolute',
        top: 0,
        bottom: 0,
        boxShadow: `0 0 10px 16px ${vars.color.bg1}`,
        zIndex: 1,
      },
    },

    '::after': {
      right: 0,
    },

    '::before': {
      left: 0,
    },
  },
  sprinkles({
    position: 'relative',
    overflow: 'hidden',
  }),
])
