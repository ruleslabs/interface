import '@reach/dialog/styles.css'
import './theme/css/global.css'

import React, { StrictMode } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { ApolloProvider } from '@apollo/client'
import { createRoot } from 'react-dom/client'

import { LanguageProvider } from 'src/providers/LanguageProvider'
import { EthereumProvider, StarknetProvider } from 'src/providers/Web3Provider'
import StyledThemeProvider from 'src/styles/theme'
import store from 'src/state'
import App from './pages/App'
import { apolloClient } from './graphql/data/apollo'
import ConfigProvider from './providers/ConfigProvider'
import ApplicationReduxUpdater from 'src/state/application/updater'
import { MulticallUpdater } from 'src/lib/state/multicall'
import { BrowserRouter } from 'react-router-dom'
import StarknetTxUpdater from './zustand/starknetTx/updater'
import ApplicationUpdate from './zustand/application/updater'

function Updaters() {
  return (
    <>
      <ApplicationReduxUpdater />
      <MulticallUpdater />
      <StarknetTxUpdater />
      <ApplicationUpdate />
    </>
  )
}

const container = document.getElementById('root')
if (!container) throw 'Undefined #root container'

const root = createRoot(container)
root.render(
  <StrictMode>
    <ReduxProvider store={store}>
      <ApolloProvider client={apolloClient}>
        <ConfigProvider>
          <StarknetProvider>
            <EthereumProvider>
              <BrowserRouter>
                <LanguageProvider>
                  <Updaters />
                  <StyledThemeProvider>
                    <App />
                  </StyledThemeProvider>
                </LanguageProvider>
              </BrowserRouter>
            </EthereumProvider>
          </StarknetProvider>
        </ConfigProvider>
      </ApolloProvider>
    </ReduxProvider>
  </StrictMode>
)
