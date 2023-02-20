import { useMemo } from 'react'

export enum CardPendingStatus {
  IN_TRANSFER = 1,
  IN_OFFER_CREATION,
  IN_OFFER_CANCELATION,
  IN_OFFER_ACCEPTANCE,
}

export type CardPendingStatusMap = { [cardId: string]: CardPendingStatus }

export default function useCardsPendingStatusMap(cards?: any[]): CardPendingStatusMap {
  return useMemo(
    () =>
      (cards ?? []).reduce<CardPendingStatusMap>((acc, card) => {
        if (card?.inTransfer) acc[card.id] = CardPendingStatus.IN_TRANSFER
        else if (card?.inOfferCreation) acc[card.id] = CardPendingStatus.IN_OFFER_CREATION
        else if (card?.inOfferCancelation) acc[card.id] = CardPendingStatus.IN_OFFER_CANCELATION
        else if (card?.inOfferAcceptance) acc[card.id] = CardPendingStatus.IN_OFFER_ACCEPTANCE

        return acc
      }, {}),
    [cards]
  )
}
