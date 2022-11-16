import React from 'react'

import { ModalHeader } from '@/components/Modal'
import Confirmation from './Confirmation'

interface EthereumSignerProps {
  children: React.ReactNode
  modalHeaderChildren?: string | React.ReactNode
  confirmationText: string
  transactionText: string
  waitingForTx: boolean
  txHash?: string
  error?: string
  onDismiss(): void
  onBack?: () => void
}

export default function EthereumSigner({
  children,
  modalHeaderChildren,
  confirmationText,
  transactionText,
  waitingForTx,
  txHash,
  error,
  onDismiss,
  onBack,
}: EthereumSignerProps) {
  return (
    <>
      <ModalHeader onDismiss={onDismiss} onBack={!txHash && !waitingForTx ? onBack : undefined}>
        {!txHash && !waitingForTx && modalHeaderChildren}
      </ModalHeader>

      {txHash || waitingForTx ? (
        <Confirmation
          txHash={txHash ?? undefined}
          error={error ?? undefined}
          confirmationText={confirmationText}
          transactionText={transactionText}
        />
      ) : (
        children
      )}
    </>
  )
}
