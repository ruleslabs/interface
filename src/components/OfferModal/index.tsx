import { useCallback, useState, useEffect } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import Modal, { ModalHeader } from '@/components/Modal'
import { useModalOpen, useOfferModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import Column from '@/components/Column'
import Offer from './Offer'
import Confirmation from './Confirmation'
import { TYPE } from '@/styles/theme'
import StarknetSigner from '@/components/StarknetSigner'

const DummyFocusInput = styled.input`
  max-height: 0;
  max-width: 0;
  position: fixed;
  left: 99999px;
`

const StyledOfferModal = styled(Column)`
  width: 546px;
  padding: 26px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 4px;

  ${({ theme }) => theme.media.medium`
    width: 100%;
    height: 100%;
  `}
`

interface OfferModalProps {
  artistName: string
  season: number
  scarcityName: string
  serialNumber: number
}

export default function OfferModal({ artistName, season, scarcityName, serialNumber }: OfferModalProps) {
  // modal
  const isOpen = useModalOpen(ApplicationModal.OFFER)
  const toggleOfferModal = useOfferModalToggle()

  // recipient
  const [recipientAddress, setRecipientAddress] = useState<string | null>(null)
  const onConfirmation = useCallback((address: string) => setRecipientAddress(address), [])

  // hash
  const [txHash, setTxHash] = useState<string | null>(null)
  const onTransaction = useCallback((hash: string) => setTxHash(hash), [])

  // error
  const [error, setError] = useState<string | null>(null)
  const onError = useCallback((error: string) => setError(error), [])

  // on close modal
  useEffect(() => {
    if (isOpen) {
      setRecipientAddress(null)
      setError(null)
      setTxHash(null)
    }
  }, [isOpen])

  return (
    <Modal onDismiss={toggleOfferModal} isOpen={isOpen}>
      <DummyFocusInput type="text" />
      <StyledOfferModal gap={26}>
        <ModalHeader onDismiss={toggleOfferModal}>
          {txHash ? (
            <div />
          ) : (
            <TYPE.large>
              <Trans>Offer this {artistName}</Trans>
              <span> </span>
              <Trans>season</Trans>
              <span> </span>
              {season}
              <span> </span>
              <Trans id={scarcityName} render={({ translation }) => translation} />
              <span> </span>#{serialNumber}
            </TYPE.large>
          )}
        </ModalHeader>
        {txHash ? (
          <Confirmation txHash={txHash ?? undefined} error={error ?? undefined} />
        ) : recipientAddress ? (
          <StarknetSigner onTransaction={onTransaction} call={{}} />
        ) : (
          <Offer onError={onError} onConfirmation={onConfirmation} />
        )}
      </StyledOfferModal>
    </Modal>
  )
}
