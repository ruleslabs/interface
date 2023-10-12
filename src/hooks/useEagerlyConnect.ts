import { useEffect } from 'react'
import { Connector } from '@web3-react/types'

import { L1Connection, networkConnection, useGetL1Connection } from 'src/connections'
import { useBoundStore } from 'src/zustand'

async function connect(connector: Connector) {
  try {
    if (connector.connectEagerly) {
      await connector.connectEagerly()
    } else {
      await connector.activate()
    }
  } catch (error) {
    console.debug(`web3-react eager connection error: ${error}`)
  }
}

export default function useEagerlyConnect() {
  useL1EagerlyConnect()
  useL2EagerlyConnect()
}

function useL1EagerlyConnect() {
  const { selectedL1Wallet, selectL1Wallet } = useBoundStore()
  const getConnection = useGetL1Connection()

  let selectedConnection: L1Connection | undefined
  if (selectedL1Wallet) {
    try {
      selectedConnection = getConnection(selectedL1Wallet)
    } catch {
      selectL1Wallet(null)
    }
  }

  useEffect(() => {
    connect(networkConnection.connector)

    if (selectedConnection) {
      connect(selectedConnection.connector)
    } // The dependency list is empty so this is only run once on mount
  }, [])
}

function useL2EagerlyConnect() {
  // TODO: impl L2 eagerly connection
  return
}
