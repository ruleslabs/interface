import { useEffect, useMemo, useState } from 'react'
import { t } from '@lingui/macro'

import { useMigrateCollectionModalToggle, useModalOpened } from 'src/state/application/hooks'
import { ApplicationModal } from 'src/state/application/actions'
import { ModalContents } from 'src/types'
import { ModalHeader } from '../Modal'
import ClassicModal, { ModalContent } from '../Modal/Classic'
import Overview from './Overview'
import CardsTransfer from './Cards'
import PacksTransfer from './Packs'

export enum MigrateCollectionModalMode {
  OVERVIEW,
  CARDS,
  PACKS,
}

function useModalContent(): ModalContents<MigrateCollectionModalMode> {
  return useMemo(
    () => ({
      [MigrateCollectionModalMode.OVERVIEW]: {
        Component: Overview,
        title: t`Collection Migration`,
      },
      [MigrateCollectionModalMode.CARDS]: {
        Component: CardsTransfer,
        title: t`Cards transfer`,
        previous: MigrateCollectionModalMode.OVERVIEW,
      },
      [MigrateCollectionModalMode.PACKS]: {
        Component: PacksTransfer,
        title: t`Packs transfer`,
        previous: MigrateCollectionModalMode.OVERVIEW,
      },
    }),
    []
  )
}

// TODO: make a generic component for moded modals
export default function WalletModal() {
  const [modalMode, setModalMode] = useState(MigrateCollectionModalMode.OVERVIEW)

  // modal
  const isOpen = useModalOpened(ApplicationModal.MIGRATE_COLLECTION)
  const toggleMigrateCollectionModal = useMigrateCollectionModalToggle()

  // modal content
  const modalContent = useModalContent()

  const renderedModalContent = useMemo(() => {
    if (modalMode === null) return null
    const ModalContent = modalContent[modalMode]

    const onBack =
      ModalContent.previous !== undefined
        ? () => {
            if (ModalContent.previous !== undefined) setModalMode(ModalContent.previous)
          }
        : undefined

    return (
      <>
        <ModalHeader onDismiss={toggleMigrateCollectionModal} onBack={onBack} title={ModalContent.title} />
        <ModalContent.Component setModalMode={setModalMode} />
      </>
    )
  }, [modalMode, toggleMigrateCollectionModal, setModalMode])

  // on modal update
  useEffect(() => {
    if (isOpen) {
      setModalMode(MigrateCollectionModalMode.OVERVIEW)
    }
  }, [isOpen])

  return (
    <ClassicModal onDismiss={toggleMigrateCollectionModal} isOpen={isOpen}>
      <ModalContent>{renderedModalContent}</ModalContent>
    </ClassicModal>
  )
}
