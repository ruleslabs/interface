/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
const { VanillaExtractPlugin } = require('@vanilla-extract/webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

const isProduction = process.env.NODE_ENV === 'production'

const shouldLintOrTypeCheck = !isProduction

module.exports = {
  babel: {
    plugins: ['@vanilla-extract/babel-plugin'],
  },
  eslint: {
    enable: shouldLintOrTypeCheck,
    pluginOptions(eslintConfig) {
      return Object.assign(eslintConfig, {
        cache: true,
        cacheLocation: 'node_modules/.cache/eslint/',
        ignorePath: '.gitignore',
      })
    },
  },
  typescript: {
    enableTypeChecking: shouldLintOrTypeCheck,
  },
  webpack: {
    plugins: [
      new VanillaExtractPlugin({ identifiers: 'short' }),
      new MiniCssExtractPlugin(),
      new NodePolyfillPlugin({
        excludeAliases: ['console'],
      }),
    ],
    configure: (webpackConfig) => {
      webpackConfig.resolve = Object.assign(webpackConfig.resolve, {
        fallback: {
          net: false,
          tls: false,
          fs: false,
        },
      })

      return webpackConfig
    },
    rules: [
      {
        test: /\.vanilla\.css$/i, // Targets only CSS files generated by vanilla-extract
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: require.resolve('css-loader'),
            options: {
              url: false, // Required as image imports should be handled via JS/TS import statements
            },
          },
        ],
      },
    ],
  },
}