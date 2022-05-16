/* eslint-disable */
// -----------------------------------------------------------------------------
// Deps
// -----------------------------------------------------------------------------

import ESLintPlugin from 'eslint-webpack-plugin'

// -----------------------------------------------------------------------------
// Next.js config
// -----------------------------------------------------------------------------

const defaultConfig = {
  reactStrictMode: true,
  webpack: (config, { dev, isServer, defaultLoaders, dir }) => {
    if (dev) {
      config.plugins.push(
        new ESLintPlugin({
          extensions: ['js', 'ts', 'tsx', 'jsx'],
          exclude: ['/node_modules/', '/.next/', '/public/'],
          failOnError: true,
        })
      )
    }

    config.module.rules.push(
      {
        resourceQuery: /raw/,
        type: 'asset/source',
      }, {
        test: /\.svg$/,
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              svgoConfig: {
                plugins: [
                  {
                    name: 'preset-default',
                    params: {
                      overrides: {
                        prefixIds: false,
                        cleanupIDs: false,
                        active: false
                      }
                    }
                  }
                ]
              }
            }
          }
        ]
      }, {
        test: /\.po$/,
        use: [
          {
            loader: "@lingui/loader",
          },
        ],
      },
    )

    config.module.rules.push(
      {
        test: /\.txt$/i,
        use: 'raw-loader'
      }
    )

    return config
  },
}

export default defaultConfig
