import { useMemo } from 'react'
import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { InjectedConnector, StarknetConfig } from '@starknet-react/core'
import { MetaMask } from '@web3-react/metamask'

import { metaMaskHooks, metaMask } from '@/constants/connectors'

// ETHEREUM

interface EthereumProviderProps {
  children: React.ReactNode
}

export function EthereumProvider({ children }: EthereumProviderProps) {
  const connectors: [MetaMask, Web3ReactHooks][] = useMemo(() => [[metaMask, metaMaskHooks]], [])

  return (
    <Web3ReactProvider connectors={connectors} key={'ethereum'}>
      {children}
    </Web3ReactProvider>
  )
}

// STARKNET

interface StarknetProviderProps {
  children: React.ReactNode
}

export function StarknetProvider({ children }: StarknetProviderProps) {
  const connectors: InjectedConnector[] = [new InjectedConnector({ options: { id: 'rules' } })]

  return (
    <StarknetConfig connectors={connectors} key={'starknet'}>
      {children}
    </StarknetConfig>
  )
}
