import { gql, useMutation } from '@apollo/client'
import { constants, WeiAmount } from '@rulesorg/sdk-core'
import { useWeb3React } from '@web3-react/core'
import JSBI from 'jsbi'
import { useCallback, useEffect, useMemo, useState } from 'react'
import AccountABI from 'src/abis/Account.json'
import ERC20ABI from 'src/abis/ERC20.json'
import { useMultipleContractSingleData } from 'src/lib/hooks/multicall'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import { AppState } from 'src/state'
import { useEthereumBlockNumber } from 'src/state/application/hooks'
import { useAppDispatch, useAppSelector } from 'src/state/hooks'
import { Abi, num, uint256 } from 'starknet'

import { setWalletModalMode, WalletModalMode } from './actions'

const RETRIEVE_ETHER_MUTATION = gql`
  mutation ($hash: String!) {
    retrieveEther(filter: { hash: $hash })
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

// TODO: support multiple addresses
function useETHBalances(...addresses: (string | undefined)[]): { [address: string]: WeiAmount | undefined } {
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

export function useETHBalance(address?: string): WeiAmount | undefined {
  const balances = useETHBalances(address)
  if (!address) return

  return balances?.[address]
}

function useSTRKBalances(...addresses: (string | undefined)[]): { [address: string]: WeiAmount | undefined } {
  const results = useMultipleContractSingleData(
    [constants.STRK_ADDRESSES[rulesSdk.networkInfos.starknetChainId]],
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

export function useSTRKBalance(address?: string): WeiAmount | undefined {
  const balances = useSTRKBalances(address)
  if (!address) return

  return balances?.[address]
}

/**
 * Is deployed
 */

export function useIsDeployed(address?: string): boolean | undefined {
  const [deployed, setDeployed] = useState<boolean | undefined>()

  useEffect(() => {
    setDeployed(undefined)

    if (!address) return

    rulesSdk.starknet
      .getNonceForAddress(address)
      .then((nonce) => {
        setDeployed(!!+nonce)
      })
      .catch(() => {
        setDeployed(false)
      })
  }, [address])

  return deployed
}

/**
 * signer escape activation date
 */

export function useSignerEscapeActivationDate(address?: string): number | undefined {
  const deployed = useIsDeployed(address)

  const callResult = useMultipleContractSingleData(
    [deployed ? address : undefined],
    AccountABI as Abi,
    'get_signer_escape_activation_date',
    {} // TODO use the right hook ^^
  )[0]

  const activeDate = callResult?.result?.active_date

  return activeDate ? +activeDate : undefined
}

/**
 * ETH Balance
 */

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
