import { ThemedCssFunction, FlattenSimpleInterpolation } from 'styled-components'

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

  platinium: string

  error: string
}

declare module 'styled-components' {
  export interface DefaultTheme extends Colors {
    media: {
      extraSmall: ThemedCssFunction<DefaultTheme>
      small: ThemedCssFunction<DefaultTheme>
      medium: ThemedCssFunction<DefaultTheme>
      mediumGT: ThemedCssFunction<DefaultTheme>
      large: ThemedCssFunction<DefaultTheme>
    }

    before: {
      alert: FlattenSimpleInterpolation<DefaultTheme>
      notifications: FlattenSimpleInterpolation<DefaultTheme>
    }

    size: {
      headerHeight: string
      headerHeightMedium: string
    }
  }
}
