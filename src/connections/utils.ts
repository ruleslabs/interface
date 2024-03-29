import { isMobile } from 'src/utils/userAgent'

import { Connection, ConnectionType } from './index'

// misc

const getIsInjected = () => Boolean(window.ethereum)

export const getIsGenericInjector = () => getIsInjected() && !getIsMetaMaskWallet() && !getIsCoinbaseWallet()

// wallet

// When using Brave browser, `isMetaMask` is set to true when using the built-in wallet
// This variable should be true only when using the MetaMask extension
// https://wallet-docs.brave.com/ethereum/wallet-detection#compatability-with-metamask
type NonMetaMaskFlag = 'isRabby' | 'isBraveWallet' | 'isTrustWallet' | 'isLedgerConnect'
const allNonMetamaskFlags: NonMetaMaskFlag[] = ['isRabby', 'isBraveWallet', 'isTrustWallet', 'isLedgerConnect']
export const getIsMetaMaskWallet = () =>
  Boolean(window.ethereum?.isMetaMask && !allNonMetamaskFlags.some((flag) => window.ethereum?.[flag]))

const getIsCoinbaseWallet = () => Boolean(window.ethereum?.isCoinbaseWallet)

const getIsArgentXWallet = () => Boolean(window.starknet_argentX)

const getIsBraavosWallet = () => Boolean(window.starknet_braavos)

// browser

export const getIsCoinbaseWalletBrowser = () => isMobile && getIsCoinbaseWallet()

const getIsMetaMaskBrowser = () => isMobile && getIsMetaMaskWallet()

export const getIsInjectedMobileBrowser = () => getIsCoinbaseWalletBrowser() || getIsMetaMaskBrowser()

// advertise

export const getShouldAdvertiseMetaMask = () => !getIsMetaMaskWallet()

export const getShouldAdvertiseArgentX = () => !getIsArgentXWallet() && !isMobile

export const getShouldAdvertiseBraavos = () => !getIsBraavosWallet()

// https://eips.ethereum.org/EIPS/eip-1193#provider-errors
enum ErrorCode {
  USER_REJECTED_REQUEST = 4001,
  UNAUTHORIZED = 4100,
  UNSUPPORTED_METHOD = 4200,
  DISCONNECTED = 4900,
  CHAIN_DISCONNECTED = 4901,

  // https://docs.metamask.io/guide/rpc-api.html#unrestricted-methods
  CHAIN_NOT_ADDED = 4902,
  MM_ALREADY_PENDING = -32002,

  WC_MODAL_CLOSED = 'Error: User closed modal',
  CB_REJECTED_REQUEST = 'Error: User denied account authorization',
}

export function didUserReject(connection: Connection, error: any): boolean {
  return (
    error?.code === ErrorCode.USER_REJECTED_REQUEST ||
    (connection.type === ConnectionType.WALLET_CONNECT && error?.toString?.() === ErrorCode.WC_MODAL_CLOSED) ||
    (connection.type === ConnectionType.COINBASE_WALLET && error?.toString?.() === ErrorCode.CB_REJECTED_REQUEST)
  )
}
