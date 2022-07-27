import { useCallback, useState } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import { ApolloError } from '@apollo/client'

import { TYPE } from '@/styles/theme'
import Modal, { ModalHeader } from '@/components/Modal'
import { useModalOpen, usePackOpeningPreparationModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import Column from '@/components/Column'
import { PrimaryButton } from '@/components/Button'
import { usePackToPrepare, usePackOpeningPreparationMutation } from '@/state/packOpening/hooks'

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

interface PackOpeningPreparationModalProps {
  onSuccess: () => void
}

export default function PackOpeningPreparationModal({ onSuccess }: PackOpeningPreparationModalProps) {
  // modal
  const isOpen = useModalOpen(ApplicationModal.PACK_OPENING_PREPARATION)
  const togglePackOpeningPreparationModal = usePackOpeningPreparationModalToggle()

  // modal state
  const [loading, setLoading] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  const pack = usePackToPrepare()

  const [packOpeningPreparationMutation] = usePackOpeningPreparationMutation()
  const preparePackOpening = useCallback(() => {
    if (!needsConfirmation) {
      setNeedsConfirmation(true)
      return
    }

    if (!pack) return

    setLoading(true)

    packOpeningPreparationMutation({ variables: { packId: pack.id } })
      .then((res: any) => {
        // TODO: handle error
        if (res?.data?.preparePackOpening?.error) console.error(res?.data?.preparePackOpening?.error)
        else {
          onSuccess()
          togglePackOpeningPreparationModal()
        }
      })
      .catch((preparePackOpeningError: ApolloError) => {
        setLoading(false)
        const error = preparePackOpeningError?.graphQLErrors?.[0]
        console.error(preparePackOpeningError) // TODO: handle error
      })
  }, [onSuccess, togglePackOpeningPreparationModal, packOpeningPreparationMutation, pack?.id, needsConfirmation])

  return (
    <Modal onDismiss={togglePackOpeningPreparationModal} isOpen={isOpen}>
      <StyledPackOpeningPreparationModal gap={26}>
        <ModalHeader onDismiss={togglePackOpeningPreparationModal}>{pack?.displayName}</ModalHeader>
        <TYPE.body>
          <Trans>
            Please, note that this action cannot be canceled and may take a few hours to complete, thanks for your
            patience.
          </Trans>
        </TYPE.body>
        <PrimaryButton onClick={preparePackOpening} disabled={loading} large>
          {needsConfirmation ? <Trans>Confirm</Trans> : <Trans>Open pack</Trans>}
        </PrimaryButton>
      </StyledPackOpeningPreparationModal>
    </Modal>
  )
}
