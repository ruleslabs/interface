import { useMemo } from 'react'
import { Contract, Abi } from 'starknet'
import { Contract as EthereumContract } from '@ethersproject/contracts'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'

import MulticallABI from '@/abis/multicall.json'
import EthereumStarkgateABI from '@/abis/ethereum/starkgate.json'

import { useStarknet } from '@/lib/starknet'
import { AddressesMap, MULTICALL_ADDRESSES, L1_STARKGATE_ADDRESSES } from '@/constants/addresses'

//
// Starknet
//

export function useContract(addressOrAddressesMap: string | AddressesMap, abi: Abi): Contract | null {
  const { network, provider } = useStarknet()

  return useMemo(() => {
    if (!network || !provider || !abi) return null

    let address: string | undefined
    if (typeof addressOrAddressesMap === 'string') address = addressOrAddressesMap
    else address = addressOrAddressesMap[network]
    if (!address) return null

    return new Contract(abi, address, provider)
  }, [addressOrAddressesMap, network, provider])
}

export function useMulticallContract(): Contract | null {
  return useContract(MULTICALL_ADDRESSES, MulticallABI as Abi)
}

//
// Ethereum
//

function getSigner(provider: Web3Provider, account: string): JsonRpcSigner {
  return provider.getSigner(account).connectUnchecked()
}

function getProviderOrSigner(provider: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  return account ? getSigner(provider, account) : provider
}

export function useEthereumContract(
  addressOrAddressesMap: string | AddressesMap,
  abi: any,
  withSignerIfPossible = true
): EthereumContract | null {
  const { chainId, provider, account } = useWeb3React()

  return useMemo(() => {
    if (!chainId || !provider || !abi) return null

    let address: string | undefined
    if (typeof addressOrAddressesMap === 'string') address = addressOrAddressesMap
    else address = addressOrAddressesMap[chainId]
    if (!address) return null

    try {
      return new EthereumContract(
        address,
        abi,
        withSignerIfPossible ? getProviderOrSigner(provider, account) : provider
      )
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [addressOrAddressesMap, chainId, provider])
}

export function useEthereumStarkgateContract(): EthereumContract | null {
  return useEthereumContract(L1_STARKGATE_ADDRESSES, EthereumStarkgateABI as Abi)
}
