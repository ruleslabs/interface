import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { Call, Signature } from 'starknet'

import { ModalHeader } from '@/components/Modal'
import Column from '@/components/Column'
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
  modalHeaderText: string
  confirmationText: string
  transactionText: string
  call?: Call
  txHash?: string
  error?: string
  onSignature(signature: Signature, maxFee: string): void
  onDismiss(): void
  onError(error: string): void
}

export default function StarknetSigner({
  modalHeaderText,
  confirmationText,
  transactionText,
  call,
  txHash,
  error,
  onSignature,
  onDismiss,
  onError,
  children,
}: StarknetSignerProps) {
  // fee estimation waiting
  const [waitingForFees, setWaitingForFees] = useState(false)
  const onWaitingForFees = useCallback((waiting: boolean) => setWaitingForFees(waiting), [])

  // transaction waiting
  const [waitingForTx, setWaitingForTx] = useState(false)
  const onConfirmation = useCallback(() => setWaitingForTx(true), [])

  return (
    <>
      <DummyFocusInput type="text" />
      <StyledStarknetSignerModal gap={26}>
        <ModalHeader onDismiss={onDismiss}>
          {txHash || waitingForTx || waitingForFees ? <div /> : modalHeaderText}
        </ModalHeader>
        {txHash || waitingForTx || waitingForFees ? (
          <Confirmation
            txHash={txHash ?? undefined}
            error={error ?? undefined}
            waitingForFees={waitingForFees}
            confirmationText={confirmationText}
            transactionText={transactionText}
          />
        ) : (
          !call && children
        )}

        <Signer
          isOpen={!txHash && !waitingForTx && !waitingForFees && !!call}
          onWaitingForFees={onWaitingForFees}
          onConfirmation={onConfirmation}
          onSignature={onSignature}
          onError={onError}
          call={call ?? undefined}
        />
      </StyledStarknetSignerModal>
    </>
  )
}
