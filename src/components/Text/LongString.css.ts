import { style } from '@vanilla-extract/css'
import { sprinkles } from 'src/theme/css/sprinkles.css'

export const longStringContainer = style([
  {
    maxWidth: 'fit-content',
  },
  sprinkles({
    backgroundColor: 'bg2',
    borderRadius: 'classic',
    padding: '8',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'bg3',
    gap: '12',
  }),
])

export const lognStringText = style([
  {
    textOverflow: 'ellipsis',
  },
  sprinkles({
    overflow: 'hidden',
  }),
])

export const copyIconContainer = style([
  sprinkles({
    color: 'text1',
    cursor: 'pointer',
    minWidth: '16',
    width: '16',
    height: '16',
    opacity: {
      hover: 'hover',
    },
  }),
])
