import { constants } from '@rulesorg/sdk-core'
import { InjectedConnector } from '@starknet-react/core'
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { initializeConnector, Web3ReactHooks } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { Connector } from '@web3-react/types'
import { useCallback } from 'react'
import { RPC_URLS } from 'src/constants/networks'
import { RPC_PROVIDERS } from 'src/constants/providers'
import ARGENT_X_ICON from 'src/images/argent-x.svg'
import BRAAVOS_ICON from 'src/images/braavos.svg'
import COINBASE_WALLET_ICON from 'src/images/coinbase-wallet.svg'
import RULES_LOGO from 'src/images/logo.svg'
import METAMASK_ICON from 'src/images/metamask.svg'
import WALLET_CONNECT_ICON from 'src/images/wallet-connect.svg'
import { isMobile } from 'src/utils/userAgent'

import {
  getIsCoinbaseWalletBrowser,
  getIsGenericInjector,
  getIsInjectedMobileBrowser,
  getIsMetaMaskWallet,
  getShouldAdvertiseArgentX,
  getShouldAdvertiseBraavos,
  getShouldAdvertiseMetaMask,
} from './utils'
import { WalletConnectPopup } from './WalletConnect'

export enum ConnectionType {
  INJECTED = 'INJECTED',
  COINBASE_WALLET = 'COINBASE_WALLET',
  WALLET_CONNECT = 'WALLET_CONNECT',
  NETWORK = 'NETWORK',
  ARGENT_X = 'ARGENT_X',
  BRAAVOS = 'BRAAVOS',
}

export interface L1Connection {
  getName(): string
  connector: Connector
  hooks: Web3ReactHooks
  type: ConnectionType
  getIcon?(): string
  shouldDisplay(): boolean
  overrideActivate?: () => boolean
}

export interface L2Connection {
  getName(): string
  connector: InjectedConnector
  type: ConnectionType
  getIcon?(): string
  shouldDisplay(): boolean
  overrideActivate?: () => boolean
}

export type Connection = L1Connection | L2Connection

function onError(error: Error) {
  console.debug(`(web3/starknet)-react error: ${error}`)
}

// NETWORK WALLET

const [web3Network, web3NetworkHooks] = initializeConnector<Network>(
  (actions) => new Network({ actions, urlMap: RPC_PROVIDERS, defaultChainId: 1 })
)

export const networkConnection: L1Connection = {
  getName: () => 'Network',
  connector: web3Network,
  hooks: web3NetworkHooks,
  type: ConnectionType.NETWORK,
  shouldDisplay: () => false,
}

// INJECTED WALLET

const [web3Injected, web3InjectedHooks] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions, onError }))

const injectedConnection: L1Connection = {
  getName: () => 'MetaMask',
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
  getIcon: () => METAMASK_ICON,
  shouldDisplay: () => getIsMetaMaskWallet() || getShouldAdvertiseMetaMask() || getIsGenericInjector(),
  // If on non-injected, prompt user to install Metamask
  overrideActivate: () => {
    if (getShouldAdvertiseMetaMask()) {
      window.open('https://metamask.io/', 'inst_metamask')
      return true
    }
    return false
  },
}

// WALLET CONNECT

const [web3WalletConnect, web3WalletConnectHooks] = initializeConnector<WalletConnectPopup>(
  (actions) => new WalletConnectPopup({ actions, onError })
)

const walletConnectConnection: L1Connection = {
  getName: () => 'WalletConnect',
  connector: web3WalletConnect,
  hooks: web3WalletConnectHooks,
  type: ConnectionType.WALLET_CONNECT,
  getIcon: () => WALLET_CONNECT_ICON,
  shouldDisplay: () => !getIsInjectedMobileBrowser(),
}

// COINBASE

const [web3CoinbaseWallet, web3CoinbaseWalletHooks] = initializeConnector<CoinbaseWallet>(
  (actions) =>
    new CoinbaseWallet({
      actions,
      options: {
        url: RPC_URLS[constants.EthereumChainId.MAINNET][0],
        appName: 'Rules',
        appLogoUrl: RULES_LOGO,
        reloadOnDisconnect: false,
      },
      onError,
    })
)

const coinbaseWalletConnection: L1Connection = {
  getName: () => 'Coinbase Wallet',
  connector: web3CoinbaseWallet,
  hooks: web3CoinbaseWalletHooks,
  type: ConnectionType.COINBASE_WALLET,
  getIcon: () => COINBASE_WALLET_ICON,
  shouldDisplay: () =>
    Boolean((isMobile && !getIsInjectedMobileBrowser()) || !isMobile || getIsCoinbaseWalletBrowser()),
  // If on a mobile browser that isn't the coinbase wallet browser, deeplink to the coinbase wallet app
  overrideActivate: () => {
    if (isMobile && !getIsInjectedMobileBrowser()) {
      window.open('https://go.cb-w.com/mtUDhEZPy1', 'cbwallet')
      return true
    }
    return false
  },
}

// ARGENT X

const starknetArgentXWallet = new InjectedConnector({ options: { id: 'argentX' } })

const argentXWalletConnection: L2Connection = {
  getName: () => 'Argent X',
  connector: starknetArgentXWallet,
  type: ConnectionType.ARGENT_X,
  getIcon: () => ARGENT_X_ICON,
  shouldDisplay: () => true,
  // If on non-injected, non-mobile browser, prompt user to install ArgentX
  overrideActivate: () => {
    if (getShouldAdvertiseArgentX()) {
      window.open('https://www.argent.xyz/argent-x/', 'inst_argent')
      return true
    }
    return false
  },
}

// BRAAVOS

const starknetBraavosWallet = new InjectedConnector({ options: { id: 'braavos' } })

const braavosWalletConnection: L2Connection = {
  getName: () => 'Braavos',
  connector: starknetBraavosWallet,
  type: ConnectionType.BRAAVOS,
  getIcon: () => BRAAVOS_ICON,
  shouldDisplay: () => true,
  // If on non-injected, prompt user to install Braavos
  overrideActivate: () => {
    if (getShouldAdvertiseBraavos()) {
      window.open('https://braavos.app/', 'inst_braavos')
      return true
    }
    return false
  },
}

// GETTERS

export function getL1Connections() {
  return [injectedConnection, walletConnectConnection, coinbaseWalletConnection, networkConnection]
}

export function getL2Connections() {
  return [argentXWalletConnection, braavosWalletConnection]
}

export function useGetL1Connection() {
  return useCallback((c: Connector | ConnectionType) => {
    if (c instanceof Connector) {
      const connection = getL1Connections().find((connection) => connection.connector === c)
      if (!connection) {
        throw Error('unsupported connector')
      }
      return connection
    } else {
      switch (c) {
        case ConnectionType.INJECTED:
          return injectedConnection

        case ConnectionType.COINBASE_WALLET:
          return coinbaseWalletConnection

        case ConnectionType.WALLET_CONNECT:
          return walletConnectConnection

        case ConnectionType.NETWORK:
          return networkConnection

        default:
          throw Error('unsupported connector')
      }
    }
  }, [])
}
