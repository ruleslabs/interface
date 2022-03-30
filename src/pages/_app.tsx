import '@/styles/global.css'

import { NextPage } from 'next/types'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import React from 'react'
import { Provider as ReduxProvider } from 'react-redux'

import { StarknetProvider } from '@/starknet'
import ApplicationUpdater from '@/state/application/updater'
import MulticallUpdater from '@/state/multicall/updater'
import { withApollo } from '@/apollo/apollo'
import DefaultLayout from '@/components/Layout'
import StyledThemeProvider from '@/styles/theme'
import store from '@/state'

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
          <Updaters />
          <Head>
            <title>Rules</title>
          </Head>
          <StyledThemeProvider>{getLayout(<Component {...pageProps} />)}</StyledThemeProvider>
        </StarknetProvider>
      </React.Fragment>
    </ReduxProvider>
  )
}

export default withApollo({ ssr: false })(App as NextPage<AppProps>)
