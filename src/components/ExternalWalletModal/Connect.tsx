import { useEffect, useMemo } from 'react'
import { t } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { useAccount } from '@starknet-react/core'

import { ModalHeader } from 'src/components/Modal'
import ClassicModal, { ModalContent, ModalBody } from 'src/components/Modal/Classic'
import { Column } from 'src/theme/components/Flex'
import { getL1Connections, getL2Connections } from 'src/connections'
import { L1Option, L2Option } from './Option'
import ConnectionErrorContent from './ConnectionErrorContent'
import { useL1ActivationState } from 'src/hooks/useL1WalletActivation'
import { ActivationStatus } from 'src/zustand/l1Wallet'
import {
  useEthereumWalletConnectModalToggle,
  useStarknetWalletConnectModalToggle,
  useWalletConnectModalOpened,
} from 'src/state/application/hooks'
import { WalletConnectModal } from 'src/state/application/actions'

// ETHEREUM

export function EthereumWalletConnectModal() {
  // account
  const { account } = useWeb3React()

  // modal
  const toggleEthereumWalletConnectModal = useEthereumWalletConnectModalToggle()
  const isOpen = useWalletConnectModalOpened(WalletConnectModal.ETHEREUM)

  // connections
  const l1Connections = getL1Connections()

  // wallet activation
  const { activationState } = useL1ActivationState()

  // close modal if a wallet is connected
  useEffect(() => {
    if (account && isOpen) {
      toggleEthereumWalletConnectModal()
    }
  }, [toggleEthereumWalletConnectModal, account, isOpen])

  const modalContent = useMemo(() => {
    if (activationState.status === ActivationStatus.ERROR) {
      return <ConnectionErrorContent />
    } else {
      return (
        <>
          <ModalHeader title={t`Connect Ethereum wallet`} onDismiss={toggleEthereumWalletConnectModal} />

          <ModalBody>
            <Column gap={'8'}>
              {l1Connections
                .filter((connection) => connection.shouldDisplay())
                .map((connection) => (
                  <L1Option key={connection.getName()} connection={connection} />
                ))}
            </Column>
          </ModalBody>
        </>
      )
    }
  }, [toggleEthereumWalletConnectModal, activationState, l1Connections])

  return (
    <ClassicModal onDismiss={toggleEthereumWalletConnectModal} isOpen={isOpen}>
      <ModalContent>{modalContent}</ModalContent>
    </ClassicModal>
  )
}

export function StarknetWalletConnectModal() {
  // account
  const { account } = useAccount()

  // modal
  const toggleStarknetWalletConnectModal = useStarknetWalletConnectModalToggle()
  const isOpen = useWalletConnectModalOpened(WalletConnectModal.STARKNET)

  // connections
  const l2Connections = getL2Connections()

  // close modal if a wallet is connected
  useEffect(() => {
    if (account && isOpen) {
      toggleStarknetWalletConnectModal()
    }
  }, [toggleStarknetWalletConnectModal, account, isOpen])

  return (
    <ClassicModal onDismiss={toggleStarknetWalletConnectModal} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader title={t`Connect Starknet wallet`} onDismiss={toggleStarknetWalletConnectModal} />

        <ModalBody>
          <Column gap={'8'}>
            {l2Connections
              .filter((connection) => connection.shouldDisplay())
              .map((connection) => (
                <L2Option key={connection.getName()} connection={connection} />
              ))}
          </Column>
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}
