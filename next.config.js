/* eslint-disable */
// -----------------------------------------------------------------------------
// Deps
// -----------------------------------------------------------------------------

const ESLintPlugin = require('eslint-webpack-plugin')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

// -----------------------------------------------------------------------------
// Next.js config
// -----------------------------------------------------------------------------

const defaultConfig = {
  reactStrictMode: true,
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.plugins.push(
        new ESLintPlugin({
          extensions: ['js', 'ts', 'tsx', 'jsx'],
          exclude: ['/node_modules/', '/.next/', '/public/'],
          failOnError: true,
        })
      )
    }

    config.plugins.push(
      new NodePolyfillPlugin({
        excludeAliases: ['console']
      }),
    )

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

    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          // fixes proxy-agent dependencies
          net: false,
          dns: false,
          tls: false,
          assert: false,
          fs: false,
          // fixes sentry dependencies
          process: false
        }
      };
    }

    return config
  },
}

module.exports = defaultConfig
