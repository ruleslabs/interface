import { t } from '@lingui/macro'

import { ModalHeader } from '@/components/Modal'
import ClassicModal, { ModalContent, ModalBody } from '@/components/Modal/Classic'
import MarketplaceFilters from '@/components/MarketplaceFilters'
import { useModalOpen, useToggleMarketplaceFiltersModal } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'

interface MarketplaceFiltersModalProps {
  maximumPriceUpperBound: number
}

export default function MarketplaceFiltersModal({ maximumPriceUpperBound }: MarketplaceFiltersModalProps) {
  // modal
  const isOpen = useModalOpen(ApplicationModal.MARKETPLACE_FILTERS)
  const toggleMarketplaceFiltersModal = useToggleMarketplaceFiltersModal()

  return (
    <ClassicModal onDismiss={toggleMarketplaceFiltersModal} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader onDismiss={toggleMarketplaceFiltersModal} title={t`Filters`} />

        <ModalBody>
          <MarketplaceFilters maximumPriceUpperBound={maximumPriceUpperBound} />
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}
