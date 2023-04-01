import { useMemo, useEffect, useState, useCallback } from 'react'
import JSBI from 'jsbi'
import { WeiAmount } from '@rulesorg/sdk-core'
import { Abi } from 'starknet'
import { useWeb3React } from '@web3-react/core'
import { gql, useMutation, useQuery } from '@apollo/client'

import ERC20ABI from '@/abis/ERC20.json'

import { BIG_INT_UINT126_HIGH_FACTOR } from '@/constants/misc'
import { useStarknet } from '@/lib/starknet'
import { ETH_ADDRESSES } from '@/constants/addresses'
import { useMultipleContractSingleData } from '@/lib/hooks/multicall'
import { useEthereumBlockNumber } from '@/state/application/hooks'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { AppState } from '@/state'
import { setWalletModalMode, WalletModalMode } from './actions'

const WAITING_TRANSACTION_QUERY = gql`
  query {
    waitingTransaction {
      hash
    }
  }
`

const TRANSFER_CARD_MUTATION = gql`
  mutation ($tokenId: String!, $recipientAddress: String!, $maxFee: String!, $nonce: String!, $signature: [String!]!) {
    transferCard(
      input: {
        tokenId: $tokenId
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
