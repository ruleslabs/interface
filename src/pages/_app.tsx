import '@/styles/global.css'
import '@/styles/fonts.css'

import React from 'react'
import { NextPage } from 'next/types'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Provider as ReduxProvider } from 'react-redux'
import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'

import { LanguageProvider } from '@/lib/i18n'
import { metaMaskHooks, metaMask } from '@/constants/connectors'
import { StarknetProvider } from '@/lib/starknet'
import ApplicationUpdater from '@/state/application/updater'
import { MulticallUpdater } from '@/lib/state/multicall'
import { withApollo } from '@/apollo/apollo'
import DefaultLayout from '@/components/Layout'
import StyledThemeProvider from '@/styles/theme'
import store from '@/state'

const connectors: [MetaMask, Web3ReactHooks][] = [[metaMask, metaMaskHooks]]

function App({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || ((page: JSX.Element) => <DefaultLayout>{page}</DefaultLayout>)

  const Updaters = () => {
    return (
      <>
        <ApplicationUpdater />
        <MulticallUpdater />
      </>
    )
  }

  return (
    <ReduxProvider store={store}>
      <LanguageProvider>
        <React.Fragment>
          <StarknetProvider network={process.env.NEXT_PUBLIC_STARKNET_NETWORK}>
            <Web3ReactProvider connectors={connectors}>
              <Updaters />
              <Head>
                <title>Rules - Trading Card Game</title>
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@ruleslabs" />
                <meta name="twitter:title" content="Rules - Trading Card Game" />
                <meta
                  name="twitter:description"
                  content="Site officiel de Rules, le jeu de cartes à collectionner sur l'univers rap. Constituez votre deck, soutenez les artistes, luttez pour l'indépendance !"
                />
                <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_APP_URL}/assets/twitter-card.jpg`} />

                <meta property="og:title" content="Rules - Trading Card Game" />
                <meta
                  property="og:description"
                  content="Site officiel de Rules, le jeu de cartes à collectionner sur l'univers rap. Constituez votre deck, soutenez les artistes, luttez pour l'indépendance !"
                />
                <meta property="og:image" content={`${process.env.NEXT_PUBLIC_APP_URL}/assets/twitter-card.jpg`} />

                <link rel="shortcut icon" href="/assets/halloween-favicon.ico" />
              </Head>
              <StyledThemeProvider>{getLayout(<Component {...pageProps} />)}</StyledThemeProvider>
            </Web3ReactProvider>
          </StarknetProvider>
        </React.Fragment>
      </LanguageProvider>
    </ReduxProvider>
  )
}

export default withApollo({ ssr: false })(App as NextPage<AppProps>)
