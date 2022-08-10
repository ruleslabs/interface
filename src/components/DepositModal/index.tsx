import { useCallback, useState, useEffect } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'

import Modal, { ModalHeader } from '@/components/Modal'
import { useModalOpen, useDepositModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import Column from '@/components/Column'
import Deposit, { Error } from './Deposit'
import Confirmation from './Confirmation'

const StyledDepositModal = styled(Column)`
  width: 546px;
  padding: 26px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 4px;

  ${({ theme }) => theme.media.medium`
    width: 100%;
    height: 100%;
  `}
`

export default function PackPurchaseModal() {
  // modal
  const isOpen = useModalOpen(ApplicationModal.DEPOSIT)
  const toggleDepositModal = useDepositModalToggle()

  // deposit
  const [amountDeposited, setAmountDeposited] = useState(0)
  const onDeposit = useCallback((amount: number) => setAmountDeposited(amount), [])

  // confirmation
  const [txHash, setTxHash] = useState(null)
  const onConfirmation = useCallback((hash: string) => setTxHash(hash), [])

  // error
  const [error, setError] = useState<Error | null>(null)
  const onError = useCallback((error: Error) => setError(error), [])

  // on close modal
  useEffect(() => {
    if (isOpen) {
      setAmountDeposited(0)
      setError(null)
      setTxHash(null)
    }
  }, [isOpen])

  return (
    <Modal onDismiss={toggleDepositModal} isOpen={isOpen}>
      <StyledDepositModal gap={26}>
        <ModalHeader onDismiss={toggleDepositModal}>{amountDeposited ? <div /> : t`Fund your account`}</ModalHeader>
        {amountDeposited ? (
          <Confirmation amountDeposited={amountDeposited} txHash={txHash ?? undefined} error={error ?? undefined} />
        ) : (
          <Deposit onDeposit={onDeposit} onError={onError} onConfirmation={onConfirmation} />
        )}
      </StyledDepositModal>
    </Modal>
  )
}
