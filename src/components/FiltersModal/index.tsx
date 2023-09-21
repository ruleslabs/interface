import { t } from '@lingui/macro'

import { ModalHeader } from 'src/components/Modal'
import ClassicModal, { ModalContent, ModalBody } from 'src/components/Modal/Classic'
import CardsFilters from 'src/components/Filters/Cards'
import MarketplaceFilters from 'src/components/Filters/Marketplace'
import { useModalOpened, useFiltersModalToggle } from 'src/state/application/hooks'
import { ApplicationModal } from 'src/state/application/actions'

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

export function MarketplaceFiltersModal() {
  return (
    <FiltersModal>
      <MarketplaceFilters />
    </FiltersModal>
  )
}
