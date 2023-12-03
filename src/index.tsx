import '@reach/dialog/styles.css'
import './theme/css/global.css'

import { ApolloProvider } from '@apollo/client'
import { createRoot } from 'react-dom/client'
// import { StrictMode } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { MulticallUpdater } from 'src/lib/state/multicall'
import { LanguageProvider } from 'src/providers/LanguageProvider'
import { EthereumProvider, StarknetProvider } from 'src/providers/Web3Provider'
import store from 'src/state'
import ApplicationReduxUpdater from 'src/state/application/updater'
import StyledThemeProvider from 'src/styles/theme'

import { apolloClient } from './graphql/data/apollo'
import App from './pages/App'
import ConfigProvider from './providers/ConfigProvider'
import ApplicationUpdate from './zustand/application/updater'
import StarknetTxUpdater from './zustand/starknetTx/updater'

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
  <>
    <ApolloProvider client={apolloClient}>
      <ConfigProvider>
        <StarknetProvider>
          <EthereumProvider>
            <ReduxProvider store={store}>
              <BrowserRouter>
                <LanguageProvider>
                  <Updaters />
                  <StyledThemeProvider>
                    <App />
                  </StyledThemeProvider>
                </LanguageProvider>
              </BrowserRouter>
            </ReduxProvider>
          </EthereumProvider>
        </StarknetProvider>
      </ConfigProvider>
    </ApolloProvider>
  </>
)
