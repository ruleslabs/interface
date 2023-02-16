import { ThemedCssFunction } from 'styled-components'

export interface Colors {
  white: string
  black: string

  primary1: string
  primary2: string

  bg1: string
  bg2: string
  bg3: string
  bg4: string
  bg5: string

  text1: string
  text2: string

  gradient1: string

  common: string
  platinium: string
  halloween: string

  lowSerial: string

  error: string

  green1: string
  green2: string

  purple: string
  pink: string
  orange: string
}

declare module 'styled-components' {
  export interface DefaultTheme extends Colors {
    media: {
      extraSmall: ThemedCssFunction<DefaultTheme>
      small: ThemedCssFunction<DefaultTheme>
      medium: ThemedCssFunction<DefaultTheme>
      mediumGT: ThemedCssFunction<DefaultTheme>
      large: ThemedCssFunction<DefaultTheme>
      computer:  ThemedCssFunction<DefaultTheme>
    }

    before: {
      alert: ThemedCssFunction<DefaultTheme>
      notifications: ThemedCssFunction<DefaultTheme>
    }

    size: {
      footerHeight: number
      headerHeight: number
      headerHeightMedium: number
    }
  }
}
