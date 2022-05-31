import { useState, useCallback, useEffect } from 'react'
import { WeiAmount } from '@rulesorg/sdk-core'

const ETH_PRICE_POLLING = 60_000 // 60s

export function useEtherEURPrice(): number | undefined {
  const [price, setPrice] = useState<number | undefined>(undefined)

  const onFetchSuccess = useCallback(
    (result: any) => {
      const amount = result?.data?.amount

      setPrice(!!amount ? +amount : undefined)
    },
    [setPrice]
  )

  const fetchEthPrice = useCallback(
    () =>
      fetch('https://api.coinbase.com/v2/prices/ETH-EUR/spot')
        .then((res) => res.json())
        .then(onFetchSuccess)
        .catch((err) => console.error(err)),
    [onFetchSuccess]
  )

  useEffect(() => {
    fetchEthPrice()

    const handler = setInterval(() => {
      fetchEthPrice()
    }, ETH_PRICE_POLLING)

    return () => {
      clearInterval(handler)
    }
  }, [fetchEthPrice])

  return price
}

export function useWeiAmountToEURValue(): (amount: WeiAmount) => string | null {
  const etherEURprice = useEtherEURPrice()

  return useCallback(
    (amount: WeiAmount) => (etherEURprice ? amount.multiply(Math.round(etherEURprice)).toFixed(2) : null),
    [etherEURprice]
  )
}
