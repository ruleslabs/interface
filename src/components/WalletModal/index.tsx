import { useEffect, useMemo } from 'react'
import { t } from '@lingui/macro'

import SidebarModal, { ModalContent } from '@/components/Modal/Sidebar'
import { useModalOpened, useWalletModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { useSetWalletModalMode, useWalletModalMode } from '@/state/wallet/hooks'
import { WalletModalMode } from '@/state/wallet/actions'

import Overview from './Overview'
import Deposit from './Deposit'
import { ModalContents } from '@/types'
import { ModalHeader } from '../Modal'

const MODAL_CONTENTS: ModalContents<WalletModalMode> = {
  [WalletModalMode.OVERVIEW]: {
    Component: Overview,
  },
  [WalletModalMode.DEPOSIT]: {
    Component: Deposit,
    title: t`Add funds`,
    previous: WalletModalMode.OVERVIEW,
  },
  [WalletModalMode.WITHDRAW]: {
    Component: Deposit,
    title: t`Add funds`,
  },
  [WalletModalMode.STARKGATE_DEPOSIT]: {
    Component: Deposit,
    title: t`Add funds`,
  },
  [WalletModalMode.STARKGATE_WITHDRAW]: {
    Component: Deposit,
    title: t`Add funds`,
  },
}

export default function WalletModal() {
  // modal
  const isOpen = useModalOpened(ApplicationModal.WALLET)
  const toggleWalletModal = useWalletModalToggle()

  // modal mode
  const walletModalMode = useWalletModalMode()
  const setWalletModalMode = useSetWalletModalMode()

  const renderedModalContent = useMemo(() => {
    if (walletModalMode === null) return null
    const ModalContent = MODAL_CONTENTS[walletModalMode]

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

  useEffect(() => {
    if (isOpen) {
      setWalletModalMode(WalletModalMode.OVERVIEW)
    }
  }, [isOpen])

  return (
    <SidebarModal onDismiss={toggleWalletModal} isOpen={isOpen} width={350} fullscreen>
      <ModalContent>{renderedModalContent}</ModalContent>
    </SidebarModal>
  )
}
