import { style } from '@vanilla-extract/css'

import { sprinkles } from 'src/theme/css/sprinkles.css'

export const profileContainer = style([
  {
    alignItems: 'flex-start',
  },
  sprinkles({
    marginTop: '24',
    justifyContent: 'space-between',
  }),
])
