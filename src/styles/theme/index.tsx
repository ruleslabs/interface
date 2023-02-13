import React, { useMemo } from 'react'
import styled, { createGlobalStyle, css, ThemeProvider } from 'styled-components'

import { Colors } from './styled'

const MEDIA_QUERIES_WIDTH = {
  extraSmall: 'max-width: 481',
  small: 'max-width: 769',
  medium: 'max-width: 1024',
  mediumGT: 'min-width: 1025',
  large: 'max-width: 1200',
}

const mediaWidth: { [breakpoint in keyof typeof MEDIA_QUERIES_WIDTH]: typeof css } = Object.keys(
  MEDIA_QUERIES_WIDTH
).reduce((acc: any, breakpoint) => {
  acc[breakpoint as keyof typeof MEDIA_QUERIES_WIDTH] = (first: any, ...interpolations: any[]) => css`
    @media only screen and (${MEDIA_QUERIES_WIDTH[breakpoint as keyof typeof MEDIA_QUERIES_WIDTH]}px) {
      ${css(first, ...interpolations)}
    }
  `
  return acc
}, {}) as any

// BEFORE

const Alert = css`
  position: relative;
  text-align: center;

  ::before {
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

  ::before {
    background: ${({ theme }) => theme.primary1};
    content: '${({ notifications = 0 }) => notifications}';
  }
`

const BEFORES_CSS = {
  alert: Alert,
  notifications: Notifications,
}

const before: { [before in keyof typeof BEFORES_CSS]: typeof css } = Object.keys(BEFORES_CSS).reduce(
  (acc: any, before) => {
    acc[before as keyof typeof BEFORES_CSS] = (first: any, ...interpolations: any[]) => css`
      ${BEFORES_CSS[before as keyof typeof BEFORES_CSS]}
      ${first && interpolations && css(first, ...interpolations)}
    `
    return acc
  },
  {}
) as any

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function colors(darkMode: boolean): Colors {
  return {
    white: '#ffffff',
    black: '#000000',

    primary1: '#9F04DC',
    primary2: '#7C03AE',

    bg1: '#0D1114',
    bg2: '#202326',
    bg3: '#535458',
    bg4: '#AFAFAF',
    bg5: '#2e3033',

    text1: '#FFFFFF',
    text2: '#909193',

    gradient1: 'linear-gradient(90deg, #6E36E7, #CB49CE)',

    common: '#8C04C1',
    platinium: '#E7E7E7',
    halloween: '#AF4027',

    error: '#CB222C',
    green1: '#0EA63B',
    green2: '#06AC77',
    purple: '#6E36E7',
    pink: '#CB49CE',
    orange: '#FF9E0D',
  }
}

function theme(darkMode: boolean) {
  return {
    ...colors(darkMode),

    media: mediaWidth,

    before,

    size: {
      footerHeight: 128,
      headerHeight: 57,
      headerHeightMedium: 62,
    },
  }
}

const ThemedGlobalStyle = createGlobalStyle`
  body {
    background-color: ${({ theme }) => theme.bg1};
  }

  h1, h2, h3, h4, h5, h6, p, a, ul, ol, label, table, input {
    color: ${({ theme }) => theme.text1};
  }
`

interface StyledThemeProviderProps {
  children: React.ReactNode
}

export default function StyledThemeProvider({ children }: StyledThemeProviderProps) {
  const darkMode = false
  const themeObject = useMemo(() => theme(darkMode), [darkMode])

  return (
    <ThemeProvider theme={themeObject}>
      <ThemedGlobalStyle />
      {children}
    </ThemeProvider>
  )
}

export interface TextWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: string
  spanColor?: string
}

export interface TextProps extends TextWrapperProps {
  fontSize?: number
  fontWeight?: number
  textAlign?: string
  clickable?: boolean
  underline?: boolean
}

const Text = styled.div<TextProps>`
  width: fit-content;
  ${({ fontSize }) => fontSize && `font-size: ${fontSize}px;`}
  ${({ fontWeight }) => fontWeight && `font-weight: ${fontWeight};`};
  ${({ textAlign }) => textAlign && `text-align: ${textAlign};`}
  ${({ underline }) => underline && 'text-decoration: underline;'}
  ${({ clickable = false }) =>
    clickable &&
    `
      cursor: pointer;

      :hover {
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
  black(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'white'} {...props} />
  },
  white(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'white'} {...props} />
  },
  link(props: TextProps) {
    return <TextWrapper fontWeight={400} color={'primary1'} clickable {...props} />
  },
  subtitle(props: TextProps) {
    return <TextWrapper fontWeight={400} color={'text2'} {...props} />
  },
  small(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={14} color={'text1'} {...props} />
  },
  body(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={16} color={'text1'} {...props} />
  },
  medium(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={18} color={'text1'} {...props} />
  },
  large(props: TextProps) {
    return <TextWrapper fontWeight={700} fontSize={26} color={'text1'} {...props} />
  },
}

export type CssDirection = 'left' | 'right' | 'bottom' | 'top'
