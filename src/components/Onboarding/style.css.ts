import { style } from '@vanilla-extract/css'
import { breakpoints, sprinkles } from 'src/theme/css/sprinkles.css'

export const onboardingContainer = sprinkles({
  position: 'absolute',
  left: '0',
  right: '0',
  margin: '0',
  top: '0',
  bottom: {
    md: '0',
  },
})

export const pageWrapper = style([
  {
    padding: '0 !important',
  },
  sprinkles({
    width: 'full',
    height: {
      md: 'full',
    },
  }),
])

const pageContainerBase = style([
  {
    height: '58vw',
    '@media': {
      [`screen and (max-width: ${breakpoints.md}px)`]: {
        height: '100%',
      },
    },
  },
  sprinkles({
    paddingX: {
      md: '16',
    },
  }),
])

export const infoPageContainer = style([
  pageContainerBase,
  sprinkles({
    display: 'flex',
    alignItems: {
      default: 'stretch',
      md: 'center',
    },
    flexDirection: {
      md: 'column',
    },
    justifyContent: {
      default: 'center',
      md: 'space-around',
    },
    gap: {
      default: '64',
      lg: '32',
      md: '0',
    },
    height: 'full',
    paddingTop: {
      default: '32',
      md: '0',
    },
    width: 'full',
  }),
])

export const infoContainer = sprinkles({
  gap: '16',
  maxWidth: '386',
  marginTop: {
    default: '64',
    md: '0',
  },
})

export const illustration = style([
  {
    objectPosition: 'bottom',
    '@media': {
      [`screen and (max-width: ${breakpoints.md}px)`]: {
        height: '40%',
        width: 'auto',
      },
    },
    width: '35%',
  },
  sprinkles({
    objectFit: 'contain',
  }),
])

export const discordPageContainer = style([
  pageContainerBase,
  sprinkles({
    display: 'flex',
    height: 'full',
    width: 'full',
    justifyContent: 'center',
    alignItems: 'center',
  }),
])
