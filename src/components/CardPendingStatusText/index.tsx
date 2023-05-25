import { Trans } from '@lingui/macro'

import { CardPendingStatus } from 'src/hooks/useCardsPendingStatusMap'

interface CardPendingStatusProps {
  pendingStatus: CardPendingStatus
}

export default function CardPendingStatusText({ pendingStatus }: CardPendingStatusProps) {
  switch (pendingStatus) {
    case CardPendingStatus.IN_TRANSFER:
    case CardPendingStatus.IN_OFFER_ACCEPTANCE:
      return <Trans>Transfer in progress...</Trans>

    case CardPendingStatus.IN_OFFER_CREATION:
      return <Trans>Sale in progress...</Trans>

    case CardPendingStatus.IN_OFFER_CANCELATION:
      return <Trans>Sale canceling in progress...</Trans>
  }
}
