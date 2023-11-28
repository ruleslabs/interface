import { useMemo } from 'react'
import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { Connector } from '@web3-react/types'

import useEagerlyConnect from 'src/hooks/useEagerlyConnect'
import { getL1Connections, getL2Connections } from 'src/connections'
import { InjectedConnector, StarknetConfig, alchemyProvider } from '@starknet-react/core'
import { goerli, mainnet } from '@starknet-react/chains'

// ETHEREUM

interface EthereumProviderProps {
  children: React.ReactNode
}

export function EthereumProvider({ children }: EthereumProviderProps) {
  useEagerlyConnect()

  const connections = getL1Connections()
  const connectors: [Connector, Web3ReactHooks][] = connections.map(({ hooks, connector }) => [connector, hooks])

  const key = useMemo(() => connections.map((connection) => connection.getName()).join('-'), [connections])

  return (
    <Web3ReactProvider connectors={connectors} key={key}>
      {children}
    </Web3ReactProvider>
  )
}

// STARKNET

interface StarknetProviderProps {
  children: React.ReactNode
}

export function StarknetProvider({ children }: StarknetProviderProps) {
  useEagerlyConnect()

  const connections = getL2Connections()
  const connectors: InjectedConnector[] = connections.map(({ connector }) => connector)

  const key = useMemo(() => connections.map((connection) => connection.getName()).join('-'), [connections])

  return (
    <StarknetConfig
      connectors={connectors}
      provider={alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_KEY ?? '' })}
      key={key}
      chains={[mainnet, goerli]}
      autoConnect
    >
      {children}
    </StarknetConfig>
  )
}
