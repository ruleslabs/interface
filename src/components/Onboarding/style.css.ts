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

export const pageWrapper = sprinkles({
  width: 'full',
  height: {
    md: 'full',
  },
})

const pageContainerBase = style([
  {
    height: '58vh',
    marginTop: '15vh',
    '@media': {
      [`screen and (max-width: ${breakpoints.md}px)`]: {
        height: '100%',
        marginTop: '0',
      },
    },
  },
  sprinkles({
    display: 'flex',
    alignItems: 'center',
    paddingX: {
      md: '16',
    },
  }),
])

export const infoPageContainer = style([
  pageContainerBase,
  sprinkles({
    flexDirection: {
      md: 'column',
    },
    justifyContent: 'space-around',
    width: 'full',
  }),
])

export const infoContainer = sprinkles({
  gap: '16',
  maxWidth: '386',
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
    width: '30%',
    height: 'fit-content',
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

export const starterPack = style([
  {
    width: '70%',
  },
])

export const rookiePack = style([
  {
    width: '25%',
  },
  sprinkles({
    paddingLeft: '8',
  }),
])
