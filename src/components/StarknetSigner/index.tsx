import React, { useCallback, useState, useEffect } from 'react'
import styled from 'styled-components'
import { Call, Signature } from 'starknet'
import { t } from '@lingui/macro'

import Column from '@/components/Column'
import { ModalHeader } from '@/components/Modal'
import { useWaitingTransactionQuery } from '@/state/wallet/hooks'
import Confirmation from './Confirmation'
import Signer from './Signer'

const DummyFocusInput = styled.input`
  max-height: 0;
  max-width: 0;
  position: fixed;
  left: 99999px;
`

const StyledStarknetSignerModal = styled(Column)`
  width: 546px;
  padding: 26px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 4px;

  ${({ theme }) => theme.media.medium`
    width: 100%;
    height: 100%;
  `}
`

interface StarknetSignerProps {
  children: React.ReactNode
  modalHeaderChildren?: string | React.ReactNode
  confirmationText: string
  confirmationActionText?: string
  transactionText: string
  transactionValue?: string
  calls?: Call[]
  txHash?: string
  error?: string
  onSignature(signature: Signature, maxFee: string, nonce: string): void
  onDismiss(): void
  onError(error: string): void
  onBack?: () => void
}

export default function StarknetSigner({
  modalHeaderChildren,
  confirmationText,
  confirmationActionText,
  transactionText,
  transactionValue,
  calls,
  txHash,
  error,
  onSignature,
  onDismiss,
  onError,
  onBack,
  children,
}: StarknetSignerProps) {
  // wallet lazyness
  const waitingTransactionQuery = useWaitingTransactionQuery()
  const waitingTransaction = waitingTransactionQuery.data?.waitingTransaction
  const loading = waitingTransactionQuery.loading

  useEffect(() => {
    if (waitingTransactionQuery.error) onError('An error has occurred, please refresh the page and try again.')
  }, [waitingTransactionQuery.error])

  // fee estimation waiting
  const [waitingForFees, setWaitingForFees] = useState(false)
  const onWaitingForFees = useCallback((waiting: boolean) => setWaitingForFees(waiting), [])

  // transaction waiting
  const [waitingForTx, setWaitingForTx] = useState(false)
  const onConfirmation = useCallback(() => setWaitingForTx(true), [])

  if (loading) return null

  return (
    <>
      <DummyFocusInput type="text" />
      <StyledStarknetSignerModal gap={26}>
        <ModalHeader
          onDismiss={onDismiss}
          onBack={!waitingTransaction && !txHash && !waitingForTx && !waitingForFees ? onBack : undefined}
        >
          {!waitingTransaction && !txHash && !waitingForTx && !waitingForFees && modalHeaderChildren}
        </ModalHeader>

        {waitingTransaction ? (
          <Confirmation
            txHash={waitingTransaction.hash}
            confirmationText={t`Your wallet is already processing another transaction`}
          />
        ) : txHash || waitingForTx || waitingForFees ? (
          <Confirmation
            txHash={txHash ?? undefined}
            error={error ?? undefined}
            waitingForFees={waitingForFees}
            confirmationText={confirmationText}
            transactionText={transactionText}
            success={!!txHash}
          />
        ) : (
          !calls && children
        )}

        <Signer
          confirmationActionText={confirmationActionText}
          isOpen={!txHash && !waitingForTx && !waitingForFees && !!calls}
          transactionValue={transactionValue}
          onWaitingForFees={onWaitingForFees}
          onConfirmation={onConfirmation}
          onSignature={onSignature}
          onError={onError}
          calls={calls ?? undefined}
        />
      </StyledStarknetSignerModal>
    </>
  )
}
