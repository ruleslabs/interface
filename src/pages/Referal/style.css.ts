import { style } from '@vanilla-extract/css'
import { sprinkles } from 'src/theme/css/sprinkles.css'
import { vars } from 'src/theme/css/vars.css'

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
  {
    ':before': {
      content: '',
      position: 'absolute',
      height: '4px',
      left: '16px',
      right: '50%',
      background: vars.color.gray500,
    },
  },
  sprinkles({
    maxWidth: '386',
    position: 'relative',
    justifyContent: 'space-between',
    width: {
      default: 'auto',
      xs: '256',
    },
  }),
])

export const avatar = style([
  {
    width: '32%',
    zIndex: '1',
  },
])

export const packImage = style([
  {
    width: '62%',
    zIndex: '1',
  },
])
