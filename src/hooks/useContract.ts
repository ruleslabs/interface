import { useMemo } from 'react'
import { Contract, Abi } from 'starknet'
import { Contract as EthereumContract } from '@ethersproject/contracts'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'

import MulticallABI from '@/abis/multicall.json'
import EthereumStarkgateABI from '@/abis/ethereum/starkgate.json'
import EthereumMulticallABI from '@/abis/ethereum/multicall.json'
import { AddressMap, constants } from '@rulesorg/sdk-core'
import { rulesSdk } from '@/lib/rulesWallet/rulesSdk'

//
// Starknet
//

export function useContract(addressOrAddressesMap: string | AddressMap, abi: Abi): Contract | null {
  const chainId = rulesSdk.networkInfos.starknetChainId

  return useMemo(() => {
    if (!abi) return null

    let address: string | undefined
    if (typeof addressOrAddressesMap === 'string') address = addressOrAddressesMap
    else address = addressOrAddressesMap[chainId]
    if (!address) return null

    return new Contract(abi, address, rulesSdk.starknet)
  }, [addressOrAddressesMap, chainId, rulesSdk.starknet])
}

export function useMulticallContract(): Contract | null {
  return useContract(constants.MULTICALL_ADDRESSES, MulticallABI as Abi)
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
  addressOrAddressesMap: string | AddressMap,
  abi: any,
  withSignerIfPossible = true
): EthereumContract | null {
  const { chainId, provider, account } = useWeb3React()

  return useMemo(() => {
    if (!chainId || !provider || !abi) return null

    const address = typeof addressOrAddressesMap === 'string' ? addressOrAddressesMap : addressOrAddressesMap[chainId]
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
  }, [addressOrAddressesMap, chainId, provider, account])
}

export function useEthereumStarkgateContract(): EthereumContract | null {
  return useEthereumContract(constants.STARKGATE_ADDRESSES, EthereumStarkgateABI as Abi)
}

export function useEthereumMulticallContract(): EthereumContract | null {
  return useEthereumContract(constants.MULTICALL_ADDRESSES, EthereumMulticallABI as Abi)
}
