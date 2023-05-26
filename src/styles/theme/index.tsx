import React, { useMemo } from 'react'
import { rawTokens } from 'src/theme/css/vars.css'
import styled, { css, ThemeProvider } from 'styled-components/macro'

const MISC_MEDIA_QUERIES = {
  computer: '(hover: hover) and (pointer: fine)',
}

export const MEDIA_QUERIES_BREAKPOINTS = {
  extraSmall: 481,
  small: 768,
  medium: 1024,
  large: 1200,
}

export const MEDIA_QUERIES: { [key in keyof typeof MEDIA_QUERIES_BREAKPOINTS]: string } & {
  [key in keyof typeof MISC_MEDIA_QUERIES]: string
} = Object.keys(MEDIA_QUERIES_BREAKPOINTS).reduce((acc: any, key: string) => {
  acc[key] = `only screen and (max-width: ${
    MEDIA_QUERIES_BREAKPOINTS[key as keyof typeof MEDIA_QUERIES_BREAKPOINTS]
  }px)`

  return acc
}, MISC_MEDIA_QUERIES)

const media: { [breakpoint in keyof typeof MEDIA_QUERIES]: typeof css } = Object.keys(MEDIA_QUERIES).reduce(
  (acc: any, breakpoint: string) => {
    acc[breakpoint] = (first: any, ...interpolations: any[]) => css`
      @media ${MEDIA_QUERIES[breakpoint as keyof typeof MEDIA_QUERIES]} {
        ${css(first, ...interpolations)}
      }
    `

    return acc
  },
  {}
)

// BEFORE

const Alert = css`
  position: relative;
  text-align: center;

  &::before {
    width: 20px;
    height: 20px;
    background: ${({ theme }) => theme.error};
    position: absolute;
    top: -8px;
    right: -8px;
    border-radius: 50%;
    content: '!';
    color: ${({ theme }) => theme.text1};
    font-size: 16px;
    font-weight: 700;
  }
`

const Notifications = css<{ notifications?: number }>`
  ${Alert}

  &::before {
    background: ${({ theme }) => theme.primary1};
    content: '${({ notifications = 0 }) => notifications}';
    top: -6px;
    right: -6px;
    font-size: 14px;
    width: 17px;
    height: 17px;
  }
`

const BEFORES_CSS = {
  alert: Alert,
  notifications: Notifications,
}

type BeforeKey = keyof typeof BEFORES_CSS

const before = (Object.keys(BEFORES_CSS) as BeforeKey[]).reduce<{ [before in BeforeKey]: typeof css }>(
  (acc: any, beforeKey) => {
    acc[beforeKey] = (first: any, ...interpolations: any[]) => css`
      ${BEFORES_CSS[beforeKey]}
      ${first && interpolations && css(first, ...interpolations)}
    `

    return acc
  },
  {} as any
)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function colors(darkMode: boolean) {
  return {
    white: rawTokens.color.white,
    black: rawTokens.color.black,

    primary1: rawTokens.color.accent,
    primary2: rawTokens.color.accentDarker,

    bg1: rawTokens.color.bg1,
    bg2: rawTokens.color.bg2,
    bg3: rawTokens.color.bg3,
    bg4: '#2e3033',

    text1: rawTokens.color.text1,
    text2: rawTokens.color.text2,

    gradient1: 'linear-gradient(90deg, #6E36E7, #CB49CE)',

    common: '#8C04C1',
    platinium: '#E7E7E7',
    halloween: '#AF4027',

    lowSerial: '#44DD53',

    error: '#CB222C',
    green1: '#0EA63B',
    green2: '#06AC77',
    purple: '#6E36E7',
    pink: '#CB49CE',
    orange: '#FB9804',
  }
}

export function getTheme(darkMode: boolean) {
  return {
    ...colors(darkMode),

    media,

    before,

    size: {
      footerHeight: 128,
      headerHeight: 57,
      headerHeightMedium: 62,
    },
  } as const
}

interface StyledThemeProviderProps {
  children: React.ReactNode
}

export default function StyledThemeProvider({ children }: StyledThemeProviderProps) {
  const darkMode = false
  const themeObject = useMemo(() => getTheme(darkMode), [darkMode])

  return <ThemeProvider theme={themeObject}>{children}</ThemeProvider>
}

export interface TextWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: string
  spanColor?: string
}

export interface TextProps extends TextWrapperProps {
  fontSize?: number
  fontWeight?: number
  fontStyle?: string
  textAlign?: string
  clickable?: boolean
  underline?: boolean
}

const Text = styled.div<TextProps>`
  width: fit-content;
  word-wrap: break-word;

  ${({ fontSize }) => fontSize && `font-size: ${fontSize}px;`}
  ${({ fontWeight }) => fontWeight && `font-weight: ${fontWeight};`};
  ${({ fontStyle }) => fontStyle && `font-style: ${fontStyle};`};
  ${({ textAlign }) => textAlign && `text-align: ${textAlign};`}
  ${({ textAlign }) => textAlign === 'center' && `width: 100%;`}
  ${({ underline }) => underline && 'text-decoration: underline;'}
  ${({ clickable = false }) =>
    clickable &&
    `
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    `}
`

const TextWrapper = styled(Text)<TextWrapperProps>`
  color: ${({ color = 'text1', theme }) => (theme as any)[color]};
  ${({ spanColor, theme }) =>
    spanColor &&
    `
      span {
        color: ${(theme as any)[spanColor]};
      }
    `}
`

export const TYPE = {
  link(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'primary1'} clickable {...props} />
  },
  subtitle(props: TextProps) {
    return <TextWrapper fontWeight={400} color={'text2'} {...props} />
  },
  small(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={14} color={'text1'} {...props} />
  },
  body(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={16} color={'text1'} {...props} />
  },
  medium(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={18} color={'text1'} {...props} />
  },
  large(props: TextProps) {
    return <TextWrapper fontWeight={700} fontSize={26} color={'text1'} {...props} />
  },
}

export type CssDirection = 'left' | 'right' | 'bottom' | 'top'
