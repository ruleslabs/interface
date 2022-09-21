import { useMemo } from 'react'

export enum CardPendingStatus {
  IN_TRANSFER = 1,
  IN_OFFER_CREATION,
  IN_OFFER_CANCELATION,
  IN_OFFER_ACCEPTANCE,
}

export default function useCardsPendingStatus(cards?: any[]): (CardPendingStatus | null)[] {
  return useMemo(
    () =>
      (cards ?? []).map((card) =>
        card?.inTransfer
          ? CardPendingStatus.IN_TRANSFER
          : card?.inOfferCreation
          ? CardPendingStatus.IN_OFFER_CREATION
          : card?.inOfferCancelation
          ? CardPendingStatus.IN_OFFER_CANCELATION
          : card?.inOfferAcceptance
          ? CardPendingStatus.IN_OFFER_ACCEPTANCE
          : null
      ),
    [cards]
  )
}
