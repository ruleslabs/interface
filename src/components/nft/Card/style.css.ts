import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

import { sprinkles } from 'src/theme/css/sprinkles.css'
import { vars } from 'src/theme/css/vars.css'

export const mediaContainer = style([
  {},
  sprinkles({
    overflow: 'hidden',
    position: 'relative',
  }),
])

export const container = recipe({
  base: [
    {
      boxSizing: 'border-box',
      isolation: 'isolate',
    },
    sprinkles({
      position: 'relative',
      borderRadius: 'classic',
      overflow: 'hidden',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'border1',
      background: 'bg2',
    }),
  ],

  variants: {
    selected: {
      true: sprinkles({
        cursor: 'pointer',
      }),
      false: sprinkles({
        opacity: 'disabled',
        cursor: 'pointer',
      }),
    },
  },

  defaultVariants: {
    selected: undefined,
  },
})

export const detailsContainer = sprinkles({
  paddingX: '8',
  paddingY: '16',
})

export const primaryInfo = style([
  {
    textOverflow: 'ellipsis',
  },
  sprinkles({
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  }),
])

export const secondaryInfo = style([
  sprinkles({
    background: 'bg3',
    paddingX: '6',
    paddingY: '2',
    borderRadius: 'classic',
  }),
])

const plasticEffect = style({
  mixBlendMode: 'hard-light',
  filter: `contrast(1.3) brightness(1.3) drop-shadow(2px 4px 6px ${vars.color.black})`,
})

export const inDelivery = style([
  plasticEffect,
  {
    top: '37.2%',
  },
  sprinkles({
    width: 'full',
    position: 'absolute',
    left: '0',
  }),
])

export const onSale = style([
  plasticEffect,
  {
    top: '22.2%',
    width: '80%',
  },
  sprinkles({
    position: 'absolute',
    right: '0',
  }),
])
