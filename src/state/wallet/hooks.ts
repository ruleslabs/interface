import { useMemo, useEffect, useState, useCallback } from 'react'
import JSBI from 'jsbi'
import { WeiAmount, constants } from '@rulesorg/sdk-core'
import { Abi, num, uint256 } from 'starknet'
import { useWeb3React } from '@web3-react/core'
import { gql, useMutation, useQuery } from '@apollo/client'

import ERC20ABI from '@/abis/ERC20.json'

import { useMultipleContractSingleData } from '@/lib/hooks/multicall'
import { useEthereumBlockNumber } from '@/state/application/hooks'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { AppState } from '@/state'
import { setWalletModalMode, WalletModalMode } from './actions'
import { rulesSdk } from '@/lib/rulesWallet/rulesSdk'

const WAITING_TRANSACTION_QUERY = gql`
  query {
    waitingTransaction {
      hash
    }
  }
`

const TRANSFER_CARD_MUTATION = gql`
  mutation (
    $tokenIds: [String!]!
    $recipientAddress: String!
    $maxFee: String!
    $nonce: String!
    $signature: [String!]!
  ) {
    transferCard(
      input: {
        tokenIds: $tokenIds
        recipientAddress: $recipientAddress
        quantity: 1
        maxFee: $maxFee
        nonce: $nonce
        signature: $signature
      }
    ) {
      hash
    }
  }
`

const CREATE_OFFERS_MUTATION = gql`
  mutation ($tokenIds: [String!]!, $prices: [String!]!, $maxFee: String!, $nonce: String!, $signature: [String!]!) {
    createOffers(
      input: { tokenIds: $tokenIds, prices: $prices, maxFee: $maxFee, nonce: $nonce, signature: $signature }
    ) {
      hash
    }
  }
`

const CANCEL_OFFER_MUTATION = gql`
  mutation ($tokenId: String!, $maxFee: String!, $nonce: String!, $signature: [String!]!) {
    cancelOffer(input: { tokenId: $tokenId, maxFee: $maxFee, nonce: $nonce, signature: $signature }) {
      hash
    }
  }
`

const ACCEPT_OFFERS_MUTATION = gql`
  mutation ($tokenIds: [String!]!, $maxFee: String!, $nonce: String!, $signature: [String!]!) {
    acceptOffers(input: { tokenIds: $tokenIds, maxFee: $maxFee, nonce: $nonce, signature: $signature }) {
      hash
    }
  }
`

const WITHDRAW_ETHER_MUTATION = gql`
  mutation ($l1Recipient: String!, $amount: String!, $maxFee: String!, $nonce: String!, $signature: [String!]!) {
    withdrawEther(
      input: { l1Recipient: $l1Recipient, amount: $amount, maxFee: $maxFee, nonce: $nonce, signature: $signature }
    ) {
      hash
    }
  }
`

const RETRIEVE_ETHER_MUTATION = gql`
  mutation ($hash: String!, $withdraws: [EtherWithdraw!]!) {
    retrieveEther(input: { hash: $hash, withdraws: $withdraws })
  }
`

const UPGRADE_WALLET_MUTATION = gql`
  mutation ($maxFee: String!, $nonce: String!, $signature: [String!]!) {
    upgradeWallet(input: { maxFee: $maxFee, nonce: $nonce, signature: $signature }) {
      hash
    }
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

export function useWaitingTransactionQuery() {
  return useQuery(WAITING_TRANSACTION_QUERY)
}

export function useTransferCardMutation() {
  return useMutation(TRANSFER_CARD_MUTATION)
}

export function useCreateOffersMutation() {
  return useMutation(CREATE_OFFERS_MUTATION)
}

export function useCancelOfferMutation() {
  return useMutation(CANCEL_OFFER_MUTATION)
}

export function useAcceptOffersMutation() {
  return useMutation(ACCEPT_OFFERS_MUTATION)
}

export function useWithdrawEtherMutation() {
  return useMutation(WITHDRAW_ETHER_MUTATION)
}

export function useRetrieveEtherMutation() {
  return useMutation(RETRIEVE_ETHER_MUTATION)
}

export function useUpgradeWalletMutation() {
  return useMutation(UPGRADE_WALLET_MUTATION)
}
