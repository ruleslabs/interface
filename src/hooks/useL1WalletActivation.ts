import { useCallback } from 'react'
import { L1Connection } from 'src/connections'
import { didUserReject } from 'src/connections/utils'
import { useBoundStore } from 'src/zustand'
import { ActivationStatus } from 'src/zustand/l1Wallet'
import { shallow } from 'zustand/shallow'

export function useTryL1Activation() {
  const { setStatus, setConnection, setError, reset, selectL1Wallet } = useBoundStore(
    (state) => ({
      setStatus: state.setl1WalletActivationStatus,
      setConnection: state.setl1WalletActivationConnection,
      setError: state.setl1WalletActivationError,
      reset: state.resetl1WalletActivationState,
      selectL1Wallet: state.selectL1Wallet,
    }),
    shallow
  )

  return useCallback(
    async (connection: L1Connection, onSuccess: () => void) => {
      // Skips wallet connection if the connection should override the default
      // behavior, i.e. install MetaMask or launch Coinbase app
      if (connection.overrideActivate?.()) return

      try {
        setStatus(ActivationStatus.PENDING)
        setConnection(connection)

        console.debug(`Connection activating: ${connection.getName()}`)
        await connection.connector.activate()

        console.debug(`Connection activated: ${connection.getName()}`)
        selectL1Wallet(connection.type)

        // Clears pending connection state
        reset()

        onSuccess()
      } catch (error) {
        // TODO(WEB-3162): re-add special treatment for already-pending injected errors & move debug to after didUserReject() check
        console.debug(`Connection failed: ${connection.getName()}`)
        console.error(error)

        // Gracefully handles errors from the user rejecting a connection attempt
        if (didUserReject(connection, error)) {
          reset()
          return
        }

        // Failed Connection events are logged here, while successful ones are logged by Web3Provider
        setStatus(ActivationStatus.ERROR)
        setError(error)
      }
    },
    [setStatus, setConnection, setError, reset, selectL1Wallet]
  )
}

function useCancelL1Activation() {
  const { connection, reset } = useBoundStore(
    (state) => ({ connection: state.l1WalletActivationConnection, reset: state.resetl1WalletActivationState }),
    shallow
  )

  return useCallback(() => {
    connection?.connector.deactivate?.()
    reset()
  }, [connection?.type, reset])
}

export function useL1ActivationState() {
  const activationState = useBoundStore(
    (state) => ({
      status: state.l1WalletActivationStatus,
      connection: state.l1WalletActivationConnection,
      error: state.l1WalletActivationError,
    }),
    shallow
  )
  const tryActivation = useTryL1Activation()
  const cancelActivation = useCancelL1Activation()

  return { activationState, tryActivation, cancelActivation }
}
