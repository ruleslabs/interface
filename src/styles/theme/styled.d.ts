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

  text1: string
  text2: string

  gradient1: string

  error: string
}

declare module 'styled-components' {
  export interface DefaultTheme extends Colors {
    media: {
      extraSmall: ThemedCssFunction<DefaultTheme>
      small: ThemedCssFunction<DefaultTheme>
      medium: ThemedCssFunction<DefaultTheme>
      large: ThemedCssFunction<DefaultTheme>
    }
  }
}
