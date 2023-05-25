import { t } from '@lingui/macro'

import { ModalHeader } from 'src/components/Modal'
import ClassicModal, { ModalContent, ModalBody } from 'src/components/Modal/Classic'
import MarketplaceFilters from 'src/components/MarketplaceFilters'
import { useModalOpened, useMarketplaceFiltersModalToggle } from 'src/state/application/hooks'
import { ApplicationModal } from 'src/state/application/actions'

interface MarketplaceFiltersModalProps {
  maximumPriceUpperBound: number
}

export default function MarketplaceFiltersModal({ maximumPriceUpperBound }: MarketplaceFiltersModalProps) {
  // modal
  const isOpen = useModalOpened(ApplicationModal.MARKETPLACE_FILTERS)
  const toggleMarketplaceFiltersModal = useMarketplaceFiltersModalToggle()

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
