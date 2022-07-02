import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import Modal, { ModalHeader } from '@/components/Modal'
import { useModalOpen, usePackOpeningPreparationModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import Column from '@/components/Column'
import { PrimaryButton } from '@/components/Button'
import { usePackToPrepare } from '@/state/packOpening/hooks'

const StyledPackOpeningPreparationModal = styled(Column)`
  width: 546px;
  padding: 26px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 4px;

  ${({ theme }) => theme.media.medium`
    width: 100%;
    height: 100%;
  `}
`

interface DepositModalProps {
  pack: any
}

export default function DepositModal() {
  // modal
  const isOpen = useModalOpen(ApplicationModal.PACK_OPENING_PREPARATION)
  const togglePackOpeningPreparationModal = usePackOpeningPreparationModalToggle()

  const pack = usePackToPrepare()

  return (
    <Modal onDismiss={togglePackOpeningPreparationModal} isOpen={isOpen}>
      <StyledPackOpeningPreparationModal gap={26}>
        <ModalHeader onDismiss={togglePackOpeningPreparationModal}>{pack?.displayName}</ModalHeader>
        <PrimaryButton large>
          <Trans>Open pack</Trans>
        </PrimaryButton>
      </StyledPackOpeningPreparationModal>
    </Modal>
  )
}
