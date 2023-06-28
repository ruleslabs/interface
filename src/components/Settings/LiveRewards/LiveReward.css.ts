import { style } from '@vanilla-extract/css'
import { sprinkles } from 'src/theme/css/sprinkles.css'
import { vars } from 'src/theme/css/vars.css'

export const bannerContainer = style([
  {
    '::after': {
      content: '',
      position: 'absolute',
      width: '100%',
      height: '128px',
      bottom: 0,
      left: 0,
      right: 0,
      background: `linear-gradient(${vars.color.transparent}, ${vars.color.black})`,
    },
  },
  sprinkles({
    position: 'relative',
    width: 'full',
  }),
])

export const banner = style([
  {
    aspectRatio: '3',
    objectFit: 'cover',
  },
  sprinkles({
    width: 'full',
  }),
])
