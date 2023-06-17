import { style } from '@vanilla-extract/css'

import { sprinkles } from 'src/theme/css/sprinkles.css'

export const listingsGrid = style([
  {
    overflow: 'visible !important',
  },
  sprinkles({
    display: 'flex',
    flexWrap: 'wrap',
    gap: { sm: '8', md: '8', lg: '12', xl: '16', default: '16' },
  }),
])
