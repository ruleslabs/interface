import { useMemo, useEffect, useState, useCallback } from 'react'
import JSBI from 'jsbi'
import { WeiAmount } from '@rulesorg/sdk-core'
import { Abi } from 'starknet'
import { useWeb3React } from '@web3-react/core'
import { gql, useMutation } from '@apollo/client'

import ERC20ABI from '@/abis/ERC20.json'

import { BIG_INT_UINT126_HIGH_FACTOR } from '@/constants/misc'
import { useStarknet } from '@/lib/starknet'
import { ETH_ADDRESSES } from '@/constants/addresses'
import { useMultipleContractSingleData } from '@/lib/hooks/multicall'
import { useEthereumBlockNumber } from '@/state/application/hooks'
import { getApolloClient } from '@/apollo/apollo'

const CURRENT_USER_NEXT_NONCE_QUERY = gql`
  query {
    currentUser {
      starknetWallet {
        nextNonce
      }
    }
  }
`

const TRANSFER_CARD_MUTATION = gql`
  mutation ($tokenId: String!, $recipientAddress: String!, $maxFee: String!, $signature: String!) {
    transferCard(
      input: {
        tokenId: $tokenId
        recipientAddress: $recipientAddress
        quantity: 1
        maxFee: $maxFee
        signature: $signature
      }
    ) {
      hash
    }
  }
`

const CREATE_OFFER_MUTATION = gql`
  mutation ($tokenId: String!, $price: String!, $maxFee: String!, $signature: String!) {
    createOffer(input: { tokenId: $tokenId, price: $price, maxFee: $maxFee, signature: $signature }) {
      hash
    }
  }
`

const CANCEL_OFFER_MUTATION = gql`
  mutation ($tokenId: String!, $maxFee: String!, $signature: String!) {
    cancelOffer(input: { tokenId: $tokenId, maxFee: $maxFee, signature: $signature }) {
      hash
    }
  }
`

const ACCEPT_OFFER_MUTATION = gql`
  mutation ($tokenId: String!, $maxFee: String!, $signature: String!) {
    acceptOffer(input: { tokenId: $tokenId, maxFee: $maxFee, signature: $signature }) {
      hash
    }
  }
`

const WITHDRAW_ETHER_MUTATION = gql`
  mutation ($recipientAddress: String!, $amount: String!, $maxFee: String!, $signature: String!) {
    withdrawEther(
      input: { recipientAddress: $recipientAddress, amount: $amount, maxFee: $maxFee, signature: $signature }
    ) {
      hash
    }
  }
`

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

export function useCurrentUserNextNonceQuery() {
  return useCallback(async () => {
    return getApolloClient()?.query({ query: CURRENT_USER_NEXT_NONCE_QUERY })
  }, [getApolloClient])
}

export function useTransferCardMutation() {
  return useMutation(TRANSFER_CARD_MUTATION)
}

export function useCreateOfferMutation() {
  return useMutation(CREATE_OFFER_MUTATION)
}

export function useCancelOfferMutation() {
  return useMutation(CANCEL_OFFER_MUTATION)
}

export function useAcceptOfferMutation() {
  return useMutation(ACCEPT_OFFER_MUTATION)
}

export function useWithdrawEtherMutation() {
  return useMutation(WITHDRAW_ETHER_MUTATION)
}
