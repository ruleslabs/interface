import { t } from '@lingui/macro'
import CardsFilters from 'src/components/Filters/Cards'
import { ModalHeader } from 'src/components/Modal'
import ClassicModal, { ModalBody, ModalContent } from 'src/components/Modal/Classic'
import { ApplicationModal } from 'src/state/application/actions'
import { useFiltersModalToggle, useModalOpened } from 'src/state/application/hooks'

function FiltersModal({ children }: React.HTMLAttributes<HTMLDivElement>) {
  // modal
  const isOpen = useModalOpened(ApplicationModal.FILTERS)
  const toggleMarketplaceFiltersModal = useFiltersModalToggle()

  return (
    <ClassicModal onDismiss={toggleMarketplaceFiltersModal} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader onDismiss={toggleMarketplaceFiltersModal} title={t`Filters`} />

        <ModalBody>{children}</ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}

export function CardsFiltersModal() {
  return (
    <FiltersModal>
      <CardsFilters />
    </FiltersModal>
  )
}
