import { useMemo, useEffect, useState } from 'react'
import JSBI from 'jsbi'
import { WeiAmount } from '@rulesorg/sdk-core'
import { Abi } from 'starknet'
import { useWeb3React } from '@web3-react/core'

import ERC20ABI from '@/abis/ERC20.json'

import { BIG_INT_UINT126_HIGH_FACTOR } from '@/constants/misc'
import { useStarknet } from '@/lib/starknet'
import { ETH_ADDRESSES } from '@/constants/addresses'
import { useMultipleContractSingleData } from '@/lib/hooks/multicall'
import { useEthereumBlockNumber } from '@/state/application/hooks'

interface Balance {
  low?: string
  high?: string
}

export function useETHBalances(addresses: string[]): { [address: string]: WeiAmount | undefined } {
  const { network } = useStarknet()

  const results = useMultipleContractSingleData(
    [network ? ETH_ADDRESSES[network] : undefined],
    ERC20ABI as Abi,
    'balanceOf',
    { address: addresses[0] } // TODO use the right hook ^^
  )

  return useMemo(() => {
    return addresses.reduce<{ [address: string]: WeiAmount | undefined }>((acc, address: string, index: number) => {
      const balance = results[index]?.result?.balance as Balance
      if (!balance?.low || !balance?.high) return acc

      const high = JSBI.multiply(JSBI.BigInt(balance.high), BIG_INT_UINT126_HIGH_FACTOR)
      const low = JSBI.BigInt(balance.low)
      const amount = JSBI.add(high, low)

      acc[address] = WeiAmount.fromRawAmount(amount)
      return acc
    }, {})
  }, [results, addresses])
}

export function useEthereumETHBalance(address?: string): WeiAmount | undefined {
  const { provider } = useWeb3React()
  const blockNumber = useEthereumBlockNumber()
  const [balance, setBalance] = useState<WeiAmount | undefined>()

  useEffect(() => {
    if (!provider || !address || !blockNumber) return
    provider.getBalance(address).then((res) => {
      if (res) setBalance(WeiAmount.fromRawAmount(JSBI.BigInt(res)))
    })
  }, [provider, address, setBalance, blockNumber])

  return balance
}
