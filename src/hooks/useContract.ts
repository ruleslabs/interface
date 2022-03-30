import { useMemo } from 'react'
import { Contract, Abi } from 'starknet'

import MulticallABI from '@/abis/multicall.json'

import { useStarknet } from '@/starknet'
import { AddressMap, MULTICALL_ADDRESSES } from '@/constants/addresses'

export function useContract(addressOrAddressMap: string | AddressMap, abi: Abi): Contract | null {
  const { network, library } = useStarknet()

  return useMemo(() => {
    if (!network || !library || !abi) return null

    let address: string | undefined
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[network]
    if (!address) return null

    return new Contract(abi, address, library)
  }, [addressOrAddressMap, network, library])
}

export function useMulticallContract(): Contract | null {
  return useContract(MULTICALL_ADDRESSES, MulticallABI as Abi)
}
