import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

import { sprinkles } from 'src/theme/css/sprinkles.css'
import { rawTokens, vars } from 'src/theme/css/vars.css'

export const container = recipe({
  base: [
    {
      boxSizing: 'border-box',
      isolation: 'isolate',
    },
    sprinkles({
      position: 'relative',
      borderRadius: 'classic',
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

export const mediaContainer = recipe({
  base: [
    {
      transition: `${vars.time.medium} ${vars.timing.ease} transform, ${vars.time.medium} ${vars.timing.ease} box-shadow`,

      selectors: {
        [`${container().split(' ')[0]}:hover &`]: {
          transform: 'scale(1.05)',
        },

        '&::before, &::after': {
          content: '',
          position: 'absolute',
          bottom: '10px',
          width: '40%',
          height: '10px',
          boxShadow: '0 5px 5px 10px rgba(0,0,0,.5)',
          zIndex: '-1',
          transition: 'all .3s ease-in-out',
        },

        '&:hover::before, &:hover::after': {
          content: 'none',
        },
      },

      '::before': {
        left: '15px',
        transform: 'skew(-5deg) rotate(-5deg)',
      },

      '::after': {
        right: '15px',
        transform: 'skew(5deg) rotate(5deg)',
      },
    },
    sprinkles({
      position: 'relative',
      borderRadius: 'card',
    }),
  ],

  variants: {
    scarcity: {
      common: {
        ':hover': {
          boxShadow: `0 4px 12px ${rawTokens.color.common}80`,
        },
      },
      platinium: {
        ':hover': {
          boxShadow: `0 4px 12px ${rawTokens.color.platinium}80`,
        },
      },
      halloween: {
        ':hover': {
          boxShadow: `0 4px 12px ${rawTokens.color.halloween}80`,
        },
      },
    },
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