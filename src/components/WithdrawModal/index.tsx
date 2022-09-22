import { useCallback, useState, useEffect } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'

import Modal, { ModalHeader } from '@/components/Modal'
import { useModalOpen, useWithdrawModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import Column from '@/components/Column'
import Withdraw from './Withdraw'
import Confirmation from './Confirmation'

const StyledWithdrawModal = styled(Column)`
  width: 546px;
  padding: 26px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 4px;

  ${({ theme }) => theme.media.medium`
    width: 100%;
    height: 100%;
  `}
`

export default function WithdrawModal() {
  // modal
  const isOpen = useModalOpen(ApplicationModal.WITHDRAW)
  const toggleWithdrawModal = useWithdrawModalToggle()

  // withdraw
  const [amountWithdrawn, setAmountWithdrawn] = useState<string | null>(null)
  const onWithdraw = useCallback((amount: string) => setAmountWithdrawn(amount), [])

  // confirmation
  const [txHash, setTxHash] = useState<string | null>(null)
  const onConfirmation = useCallback((hash: string) => setTxHash(hash), [])

  // error
  const [error, setError] = useState<string | null>(null)
  const onError = useCallback((error: string) => setError(error), [])

  // on close modal
  useEffect(() => {
    if (isOpen) {
      setAmountWithdrawn(null)
      setError(null)
      setTxHash(null)
    }
  }, [isOpen])

  return (
    <Modal onDismiss={toggleWithdrawModal} isOpen={isOpen}>
      <StyledWithdrawModal gap={26}>
        <ModalHeader onDismiss={toggleWithdrawModal}>
          {amountWithdrawn ? <div /> : t`Withdraw your balance`}
        </ModalHeader>
        {amountWithdrawn ? (
          <Confirmation
            amountWithdrawn={amountWithdrawn ?? undefined}
            txHash={txHash ?? undefined}
            error={error ?? undefined}
          />
        ) : (
          <Withdraw onWithdraw={onWithdraw} onError={onError} onConfirmation={onConfirmation} />
        )}
      </StyledWithdrawModal>
    </Modal>
  )
}
