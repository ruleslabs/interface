import React from 'react'
import styled from 'styled-components'

import { ModalHeader } from '@/components/Modal'
import Column from '@/components/Column'
import Confirmation from './Confirmation'

const StyledEthereumSignerModal = styled(Column)`
  width: 546px;
  padding: 26px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 4px;

  ${({ theme }) => theme.media.medium`
    width: 100%;
    height: 100%;
  `}
`

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
      <StyledEthereumSignerModal gap={26}>
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
      </StyledEthereumSignerModal>
    </>
  )
}
