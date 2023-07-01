import { style } from '@vanilla-extract/css'
import { sprinkles } from 'src/theme/css/sprinkles.css'

export const sectionContainer = sprinkles({
  justifyContent: 'center',
  padding: '16',
  maxWidth: '1242',
  marginX: 'auto',
})

export const contentContainer = style([
  {
    maxHeight: '850px',
  },
  sprinkles({
    justifyContent: 'space-around',
    height: 'full',
  }),
])

export const logoContainer = style([
  {
    width: '80%',
  },
  sprinkles({
    color: 'text1',
    marginX: 'auto',
    maxWidth: '440',
  }),
])

export const infoContainer = sprinkles({
  gap: '16',
  maxWidth: '332',
})

export const infoPageContainer = style([
  sprinkles({
    gap: '32',
    flexDirection: {
      md: 'column',
    },
    justifyContent: 'space-around',
    width: 'full',
    display: 'flex',
    alignItems: 'center',
    paddingX: {
      md: '16',
    },
    paddingBottom: '24',
  }),
])

export const imagesContainer = style([
  sprinkles({
    maxWidth: '386',
    justifyContent: 'space-between',
  }),
])

export const avatar = style([
  {
    width: '25%',
  },
])

export const packImage = style([
  {
    width: '70%',
  },
])
