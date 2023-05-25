import { useMemo, useEffect, useState, useCallback } from 'react'
import JSBI from 'jsbi'
import { WeiAmount, constants } from '@rulesorg/sdk-core'
import { Abi, num, uint256 } from 'starknet'
import { useWeb3React } from '@web3-react/core'
import { gql, useMutation } from '@apollo/client'

import ERC20ABI from 'src/abis/ERC20.json'

import { useMultipleContractSingleData } from 'src/lib/hooks/multicall'
import { useEthereumBlockNumber } from 'src/state/application/hooks'
import { useAppDispatch, useAppSelector } from 'src/state/hooks'
import { AppState } from 'src/state'
import { setWalletModalMode, WalletModalMode } from './actions'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'

const RETRIEVE_ETHER_MUTATION = gql`
  mutation ($hash: String!, $withdraws: [EtherWithdraw!]!) {
    retrieveEther(input: { hash: $hash, withdraws: $withdraws })
  }
`

// Modal mode

export function useWalletModalMode(): AppState['wallet']['walletModalMode'] {
  return useAppSelector((state: AppState) => state.wallet.walletModalMode)
}

export function useSetWalletModalMode(): (walletModalMode: WalletModalMode) => void {
  const dispatch = useAppDispatch()
  return useCallback(
    (walletModalMode: WalletModalMode) => dispatch(setWalletModalMode({ walletModalMode })),
    [dispatch]
  )
}

// balance

export function useETHBalances(addresses: (string | undefined)[]): { [address: string]: WeiAmount | undefined } {
  const results = useMultipleContractSingleData(
    [constants.ETH_ADDRESSES[rulesSdk.networkInfos.starknetChainId]],
    ERC20ABI as Abi,
    'balanceOf',
    { address: addresses[0] } // TODO use the right hook ^^
  )

  return useMemo(() => {
    return addresses.reduce<{ [address: string]: WeiAmount | undefined }>(
      (acc, address: string | undefined, index: number) => {
        const balance = results[index]?.result?.balance as any // as any... We'll do better later é_è
        if (!balance?.low || !balance?.high || !address) {
          return acc
        }

        const amount = uint256.uint256ToBN(balance)
        acc[address] = WeiAmount.fromRawAmount(num.toHex(amount))
        return acc
      },
      {}
    )
  }, [results, addresses])
}

export function useETHBalance(address?: string): WeiAmount {
  const balances = useETHBalances([address])
  if (!address) return WeiAmount.ZERO

  return balances?.[address] ?? WeiAmount.ZERO
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

export function useRetrieveEtherMutation() {
  return useMutation(RETRIEVE_ETHER_MUTATION)
}
