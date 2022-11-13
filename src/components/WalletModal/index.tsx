import { useCallback } from 'react'
import styled from 'styled-components'

import Modal, { ModalHeader } from '@/components/Modal'
import { useModalOpen, useWalletModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { useCurrentUser } from '@/state/user/hooks'
import { useWalletModalMode, useSetWalletModalMode } from '@/state/wallet/hooks'
import { WalletModalMode } from '@/state/wallet/actions'
import Column from '@/components/Column'
import { PrimaryButton } from '@/components/Button'

import Withdraw from './Withdraw'
import Deposit from './Deposit'
import Retrieve from './Retrieve'

const StyledWalletModal = styled(Column)`
  width: 546px;
  padding: 26px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 4px;

  ${({ theme }) => theme.media.medium`
    width: 100%;
    height: 100%;
  `}
`

export default function WalletModal() {
  // current user
  const currentUser = useCurrentUser()

  // modal
  const isOpen = useModalOpen(ApplicationModal.WALLET)
  const toggleWalletModal = useWalletModalToggle()

  // modal mode
  const walletModalMode = useWalletModalMode()
  const setWalletModalMode = useSetWalletModalMode()
  const onWithdraw = useCallback(() => setWalletModalMode(WalletModalMode.WITHDRAW), [setWalletModalMode])

  const renderModal = useCallback(() => {
    switch (walletModalMode) {
      case WalletModalMode.WITHDRAW:
        return <Withdraw />

      case WalletModalMode.DEPOSIT:
        return <Deposit />

      case WalletModalMode.RETRIEVE:
        return <Retrieve />
    }
    return null
  }, [walletModalMode])

  return (
    <Modal onDismiss={toggleWalletModal} isOpen={isOpen}>
      {walletModalMode !== null ? (
        renderModal()
      ) : (
        <StyledWalletModal>
          <ModalHeader onDismiss={toggleWalletModal}>{'HEY'}</ModalHeader>
          <PrimaryButton onClick={onWithdraw}>hola</PrimaryButton>
        </StyledWalletModal>
      )}
    </Modal>
  )
}
