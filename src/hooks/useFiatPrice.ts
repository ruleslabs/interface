import { WeiAmount } from '@rulesorg/sdk-core'
import { useCallback } from 'react'
import { useEtherPrice } from 'src/state/application/hooks'

export function useWeiAmountToEURValue(): (amount?: WeiAmount) => number | null {
  const etherEURprice = useEtherPrice()

  return useCallback(
    (amount?: WeiAmount) =>
      etherEURprice && amount ? Math.round(+amount.toFixed(6) * etherEURprice * 100) / 100 : null,
    [etherEURprice]
  )
}
