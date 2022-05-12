import { useMemo } from 'react'
import { Contract, Abi } from 'starknet'
import { Contract as EthereumContract } from '@ethersproject/contracts'
import { useWeb3React } from '@web3-react/core'

import MulticallABI from '@/abis/multicall.json'

import { useStarknet } from '@/starknet'
import { AddressMap, MULTICALL_ADDRESSES, ETHEREUM_MULTICALL_ADDRESSES } from '@/constants/addresses'

//
// Starknet
//

export function useContract(addressOrAddressMap: string | AddressMap, abi: Abi): Contract | null {
  const { network, provider } = useStarknet()

  return useMemo(() => {
    if (!network || !provider || !abi) return null

    let address: string | undefined
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[network]
    if (!address) return null

    return new Contract(abi, address, provider)
  }, [addressOrAddressMap, network, provider])
}

export function useMulticallContract(): Contract | null {
  return useContract(MULTICALL_ADDRESSES, MulticallABI as Abi)
}

//
// Ethereum
//

export function useEthereumContract(addressOrAddressMap: string | AddressMap, abi: any) {
  const { chainId, provider } = useWeb3React()

  return useMemo(() => {
    if (!chainId || !provider || !abi) return null

    let address: string | undefined
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]
    if (!address) return null

    try {
      return new EthereumContract(address, abi, provider)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [addressOrAddressMap, chainId, provider])
}

export function useEthereumMulticallContract(): Contract | null {
  return useEthereumContract(ETHEREUM_MULTICALL_ADDRESSES, MulticallABI as Abi)
}
