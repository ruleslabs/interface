import { style } from '@vanilla-extract/css'

import { breakpoints, sprinkles } from 'src/theme/css/sprinkles.css'
import { sizes } from 'src/theme/css/vars.css'

export const sidebaseContainer = style([
  {
    height: 'fit-content',
    top: `${sizes.headerHeight + 32}px`,

    '@media': {
      [`screen and (max-width: ${breakpoints.lg}px)`]: {
        top: `${sizes.headerHeightMedium + 32}px`,
      },
    },
  },
  sprinkles({
    gap: '16',
    position: 'sticky',
    minWidth: '200',
    display: {
      lg: 'none',
      default: 'block',
    },
  }),
])

export const searchButtonsContainer = style([
  sprinkles({
    gap: '16',
    justifyContent: {
      lg: 'space-between',
    },
    width: {
      lg: 'full',
    },
  }),
])
