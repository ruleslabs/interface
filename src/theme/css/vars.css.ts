import { createGlobalTheme, createGlobalThemeContract } from '@vanilla-extract/css'
import { darken, lighten, transparentize } from 'polished'

const colors = {
  transparent: 'transparent',
  none: 'none',
  white: '#ffffff',
  black: '#000000',

  gray50: '#f7f7f7',
  gray950: '#0D1114',
  gray900: '#191B1D',
  gray800: '#33373b',
  gray500: '#828585',

  dangerousRed: '#CB222C',

  vibrantPurple: '#9F04DC',
  offWhite: '#e7e7e7',
  spookyOrange: '#af4027',
  mayaBlue: '#56c8fe',
  regalBlue: '#1d2357',
}

export const sizes = {
  headerHeight: 57,
  headerHeightMedium: 62,
}

const fontSizes = {
  '0': '0',
  '14': '14px',
  '16': '16px',
  '18': '18px',
  '24': '24px',
  '32': '32px',
}

const times = {
  slow: '500ms',
  medium: '250ms',
  fast: '125ms',
}

const timings = {
  ease: 'ease',
  in: 'ease-in',
  out: 'ease-out',
  inOut: 'ease-in-out',
}

const opacities = {
  disabled: '0.5',
  enabled: '1',
  hover: '0.9',
  focused: '0.8',
}

const nullify = <T extends { [key: string]: string }>(obj: T) =>
  Object.keys(obj).reduce<{ [key in keyof typeof obj]: null }>((acc, key) => ({ ...acc, [key]: null }), {} as any)

const themeContractValues = {
  color: {
    ...nullify(colors),

    text1: null,
    text2: null,

    bg1: null,
    bg1Transparent: null,

    bg2: null,

    bg3: null,
    bg3Light: null,
    bg3Lighter: null,

    border1: null,

    accent: null,
    accentDark: null,
    accentDarker: null,

    error: null,

    common: null,
    platinium: null,
    halloween: null,
    holo: null,
    live: null,
  },
  border: {
    light: null,
    none: null,
  },
  radii: {
    classic: null,
    round: null,
    card: null,
  },
  fontSize: nullify(fontSizes),
  fontWeight: {
    normal: null,
    medium: null,
    semibold: null,
    bold: null,
  },
  fonts: {
    body: null,
    heading: null,
  },
  shadows: {
    none: null,
  },
  opacity: nullify(opacities),
  time: nullify(times),
  timing: nullify(timings),
}

export const vars = createGlobalThemeContract(themeContractValues, (_, path) => `theme-${path.join('-')}`)

export const dimensions = {
  '0': '0',
  '2': '2',
  '4': '4px',
  '8': '8px',
  '12': '12px',
  '16': '16px',
  '18': '18px',
  '20': '20px',
  '24': '24px',
  '26': '26px',
  '28': '28px',
  '32': '32px',
  '36': '36px',
  '40': '40px',
  '42': '42px',
  '44': '44px',
  '48': '48px',
  '52': '52px',
  '54': '54px',
  '56': '56px',
  '60': '60px',
  '64': '64px',
  '68': '68px',
  '72': '72px',
  '80': '80px',
  '100': '100px',
  '120': '120px',
  '140': '140px',
  '200': '200px',
  '256': '256px',
  '276': '276px',
  '288': '288px',
  '292': '292px',
  '332': '332px',
  '386': '386px',
  '440': '440px',
  '1242': '1242px',
  half: '50%',
  full: '100%',
  min: 'min-content',
  max: 'max-content',
  viewHeight: '100vh',
  viewWidth: '100vw',
  auto: 'auto',
  inherit: 'inherit',
}

export const spacing = {
  '0': '0',
  '1': '1px',
  '2': '2px',
  '4': '4px',
  '6': '6px',
  '8': '8px',
  '10': '10px',
  '12': '12px',
  '14': '14px',
  '16': '16px',
  '18': '18px',
  '20': '20px',
  '24': '24px',
  '28': '28px',
  '32': '32px',
  '36': '36px',
  '40': '40px',
  '48': '48px',
  '50': '50px',
  '52': '52px',
  '56': '56px',
  '60': '60px',
  '64': '64px',
  '82': '82px',
  '72': '72px',
  '88': '88px',
  '100': '100px',
  '104': '104px',
  '136': '136px',
  '150': '150px',
  '1/2': '50%',
  full: '100%',
  auto: 'auto',
  unset: 'unset',
}

export const zIndices = {
  auto: 'auto',
  '1': '1',
  '2': '2',
  '3': '3',
  sticky: '1020',
  fixed: '1030',
  modalBackdrop: '1040',
  modal: '1060',
  tooltip: '1080',
}

export const rawTokens = {
  color: {
    ...colors,

    text1: colors.gray50,
    text2: colors.gray500,

    bg1: colors.gray950,
    bg1Transparent: transparentize(0.5, colors.gray950),

    bg2: colors.gray900,

    bg3: colors.gray800,
    bg3Light: lighten(0.05, colors.gray800),
    bg3Lighter: lighten(0.1, colors.gray800),

    border1: colors.gray800,

    accent: colors.vibrantPurple,
    accentDark: darken(0.05, colors.vibrantPurple),
    accentDarker: darken(0.1, colors.vibrantPurple),

    error: colors.dangerousRed,

    common: colors.vibrantPurple,
    platinium: colors.offWhite,
    halloween: colors.spookyOrange,
    holo: colors.mayaBlue,
    live: colors.regalBlue,
  },
  border: {
    light: '1px solid rgba(0, 0, 0, 0.3)',
    none: 'none',
  },
  radii: {
    classic: '6px',
    round: '9999px',
    card: '4.7% / 3.35%',
  },
  fontSize: fontSizes,
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  fonts: {
    body: 'Inter, sans-serif',
    heading: 'montserrat, sans-serif',
  },
  shadows: {
    none: 'none',
  },
  time: times,
  timing: timings,
  opacity: opacities,
}

createGlobalTheme(':root', vars, rawTokens)
