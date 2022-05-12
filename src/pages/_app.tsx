import '@/styles/global.css'
import '@/styles/fonts.css'

import { NextPage } from 'next/types'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import React from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'

import { metaMaskHooks, metaMask } from '@/constants/connectors'
import { StarknetProvider } from '@/starknet'
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
      <React.Fragment>
        <StarknetProvider network={process.env.NEXT_PUBLIC_STARKNET_NETWORK}>
          <Web3ReactProvider connectors={connectors}>
            <Updaters />
            <Head>
              <title>Rules</title>
            </Head>
            <StyledThemeProvider>{getLayout(<Component {...pageProps} />)}</StyledThemeProvider>
          </Web3ReactProvider>
        </StarknetProvider>
      </React.Fragment>
    </ReduxProvider>
  )
}

export default withApollo({ ssr: false })(App as NextPage<AppProps>)
