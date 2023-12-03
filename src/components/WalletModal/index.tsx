import { t } from '@lingui/macro'
import { useMemo } from 'react'
import SidebarModal, { ModalContent } from 'src/components/Modal/Sidebar'
import { ApplicationModal } from 'src/state/application/actions'
import { useModalOpened, useWalletModalToggle } from 'src/state/application/hooks'
import { WalletModalMode } from 'src/state/wallet/actions'
import { useSetWalletModalMode, useWalletModalMode } from 'src/state/wallet/hooks'
import { ModalContents } from 'src/types'

import { ModalHeader } from '../Modal'
import Deploy from './Deploy'
import Deposit from './Deposit'
import MigrateFunds from './MigrateFunds'
import OldOverview from './OldOverview'
import Overview from './Overview'
import StarkgateDeposit from './StarkgateDeposit'
import StarkgateWithdraw from './StarkgateWithdraw'
import StarknetWithdraw from './StarknetWithdraw'
import Withdraw from './Withdraw'

function useModalContent(): ModalContents<WalletModalMode> {
  return useMemo(
    () => ({
      [WalletModalMode.OVERVIEW]: {
        Component: Overview,
        title: t`Wallet`,
      },
      [WalletModalMode.OLD_OVERVIEW]: {
        Component: OldOverview,
        title: t`Old Wallet`,
        previous: WalletModalMode.OVERVIEW,
      },
      [WalletModalMode.DEPLOY]: {
        Component: Deploy,
        title: t`Wallet`,
        previous: WalletModalMode.OVERVIEW,
      },
      [WalletModalMode.DEPOSIT]: {
        Component: Deposit,
        title: t`Add funds`,
        previous: WalletModalMode.OVERVIEW,
      },
      [WalletModalMode.STARKGATE_DEPOSIT]: {
        Component: StarkgateDeposit,
        title: t`Add funds`,
        previous: WalletModalMode.DEPOSIT,
      },
      [WalletModalMode.WITHDRAW]: {
        Component: Withdraw,
        title: t`Withdraw`,
        previous: WalletModalMode.OVERVIEW,
      },
      [WalletModalMode.STARKGATE_WITHDRAW]: {
        Component: StarkgateWithdraw,
        title: t`Withdraw to Ethereum`,
        previous: WalletModalMode.WITHDRAW,
      },
      [WalletModalMode.STARKNET_WITHDRAW]: {
        Component: StarknetWithdraw,
        title: t`Withdraw to Starknet`,
        previous: WalletModalMode.WITHDRAW,
      },
      [WalletModalMode.MIGRATE_FUNDS]: {
        Component: MigrateFunds,
        title: t`Retrieve your funds`,
        previous: WalletModalMode.OLD_OVERVIEW,
      },
    }),
    []
  )
}

// TODO: make a generic component for moded modals
export default function WalletModal() {
  // modal
  const isOpen = useModalOpened(ApplicationModal.WALLET)
  const toggleWalletModal = useWalletModalToggle()

  // modal mode
  const walletModalMode = useWalletModalMode()
  const setWalletModalMode = useSetWalletModalMode()

  // modal content
  const modalContent = useModalContent()

  const renderedModalContent = useMemo(() => {
    if (walletModalMode === null) return null
    const ModalContent = modalContent[walletModalMode]

    const onBack =
      ModalContent.previous !== undefined
        ? () => {
            if (ModalContent.previous !== undefined) setWalletModalMode(ModalContent.previous)
          }
        : undefined

    return (
      <>
        <ModalHeader onDismiss={toggleWalletModal} onBack={onBack} title={ModalContent.title} />
        <ModalContent.Component />
      </>
    )
  }, [walletModalMode, toggleWalletModal, setWalletModalMode])

  return (
    <SidebarModal onDismiss={toggleWalletModal} isOpen={isOpen} width={350} fullscreen>
      <ModalContent>{renderedModalContent}</ModalContent>
    </SidebarModal>
  )
}
