import { useCallback } from 'react'
import { WeiAmount } from '@rulesorg/sdk-core'

import { useEtherPrice } from '@/state/application/hooks'

export function useWeiAmountToEURValue(): (amount?: WeiAmount) => string | null {
  const etherEURprice = useEtherPrice()

  return useCallback(
    (amount?: WeiAmount) => (etherEURprice && amount ? amount.multiply(Math.round(etherEURprice)).toFixed(2) : null),
    [etherEURprice]
  )
}

export function useEurAmountToWeiAmount(): (amount?: number) => WeiAmount | null {
  const etherEURprice = useEtherPrice()

  return useCallback(
    (amount?: number) =>
      etherEURprice && amount ? WeiAmount.fromEtherAmount(amount / Math.round(etherEURprice)) : null,
    [etherEURprice]
  )
}
