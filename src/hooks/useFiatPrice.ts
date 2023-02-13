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
