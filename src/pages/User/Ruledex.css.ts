import { style } from '@vanilla-extract/css'
import { sprinkles } from 'src/theme/css/sprinkles.css'

export const actionsContainer = style([
  sprinkles({
    gap: '32',
    display: 'flex',
    flexDirection: {
      default: 'row',
      lg: 'column-reverse',
    },
  }),
])
