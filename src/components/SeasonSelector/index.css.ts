import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import { sprinkles } from 'src/theme/css/sprinkles.css'

export const seasonsContainer = style([
  sprinkles({
    paddingX: '16',
    background: 'bg2',
    borderRadius: 'classic',
    justifyContent: 'center',
    gap: '16',
    height: '54',
    alignItems: 'center',
  }),
])

export const seasonButton = recipe({
  base: [
    sprinkles({
      opacity: {
        hover: 'hover',
      },
      cursor: 'pointer',
    }),
  ],

  variants: {
    active: {
      false: sprinkles({
        opacity: 'disabled',
      }),
    },
  },
})
