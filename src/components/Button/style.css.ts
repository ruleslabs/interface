import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

import { sprinkles } from 'src/theme/css/sprinkles.css'
import { vars } from 'src/theme/css/vars.css'
import { recipes } from 'src/theme/utils/recipes'

export const base = recipe({
  base: sprinkles({
    borderRadius: 'classic',
    fontWeight: 'medium',
    cursor: 'pointer',
    fontSize: '16',
    color: 'text1',
    paddingY: '8',
    paddingX: '16',
    border: 'none',
  }),

  variants: {
    large: {
      true: sprinkles({ minHeight: '54' }),
      false: sprinkles({ minHeight: '40' }),
    },
    disabled: {
      true: [
        {
          background: `${vars.color.bg3} !important`,
          outline: 'none !important',
          cursor: 'default !important',
        },
        sprinkles({ opacity: 'disabled' }),
      ],
    },
  },

  defaultVariants: {
    large: false,
    disabled: false,
  },
})

export const primaryButton = recipes(
  base,
  recipe({
    base: [
      {
        background: `radial-gradient(circle, ${vars.color.accentDarker} 0, ${vars.color.accent} 50%)`,
      },
      sprinkles({
        paddingX: '16',
        background: {
          hover: 'accentDark',
          focus: 'accentDarker',
          active: 'accentDarker',
        },
        outlineStyle: 'solid',
        outlineWidth: '1px',
        outlineColor: {
          default: 'transparent',
          hover: 'accentDark',
          focus: 'accentDarker',
          active: 'accentDarker',
        },
        color: 'text1',
      }),
    ],
  })
)

export const secondaryButton = recipes(
  base,
  recipe({
    base: [
      sprinkles({
        paddingRight: '16',
        background: 'bg3',
        transitionDuration: 'fast',
        backgroundColor: {
          default: 'bg3',
          hover: 'bg3Lighter',
        },
      }),
    ],

    variants: {
      withIcon: {
        true: style({ paddingLeft: '8px' }),
      },
    },

    defaultVariants: {
      withIcon: false,
    },
  })
)

export const cardButton = recipes(
  secondaryButton as any,
  recipe({
    base: [
      {
        textAlign: 'left',
      },
      sprinkles({
        paddingY: '16',
        gap: '8',
      }),
    ],
  })
)

export const cardButtonIconContainer = sprinkles({
  width: '24',
  height: '24',
  color: 'text1',
})
