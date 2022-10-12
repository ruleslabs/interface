import urljoin from 'url-join'
import {
  number,
  transaction,
  hash,
  stark,
  json,
  constants,
  api,
  Account,
  EstimateFee,
  EstimateFeeResponse,
  KeyPair,
  Call,
} from 'starknet'

import { networkId, feederGatewayUrl, ProviderUrlNetworksMap } from '@/constants/networks'
import getNonce from './getNonce'
import signTransaction from './signTransaction'

const feeTransactionVersionBase = number.toBN(2).pow(number.toBN(128))

function parseFeeEstimateResponse(res: api.Sequencer.EstimateFeeResponse): EstimateFeeResponse {
  if ('overall_fee' in res) {
    let gasInfo = {}

    try {
      gasInfo = {
        gas_consumed: number.toBN(res.gas_usage),
        gas_price: number.toBN(res.gas_price),
      }
    } catch {
      // do nothing
    }

    return {
      overall_fee: number.toBN(res.overall_fee),
      ...gasInfo,
    }
  }
  return {
    overall_fee: number.toBN(res.amount),
  }
}

export default async function estimateFee(
  account: Account,
  keyPair: KeyPair,
  calls: Call | Call[],
  transactionVersion: number
): Promise<EstimateFee> {
  const feeTransactionVersion = feeTransactionVersionBase.add(number.toBN(transactionVersion))

  switch (transactionVersion) {
    case 0:
      const networkUrl = ProviderUrlNetworksMap[networkId]
      if (!networkUrl) throw 'Failed to get network URL'

      const url = urljoin(networkUrl, feederGatewayUrl, 'estimate_fee?blockNumber=pending')

      const transactions = Array.isArray(calls) ? calls : [calls]
      const nonce = await getNonce(account, transactionVersion)

      const calldata = transaction.fromCallsToExecuteCalldataWithNonce(transactions, nonce)

      const signature = await signTransaction(
        transactions,
        {
          walletAddress: account.address,
          version: feeTransactionVersion,
          maxFee: constants.ZERO,
          chainId: account.chainId,
          nonce,
        },
        transactionVersion,
        { keyPair }
      )

      const res = await fetch(url, {
        method: 'POST',
        body: json.stringify({
          contract_address: account.address,
          entry_point_selector: hash.getSelectorFromName('__execute__'),
          calldata: calldata ?? [],
          signature: number.bigNumberishArrayToDecimalStringArray(signature || []),
          version: number.toHex(number.toBN(feeTransactionVersion)),
        }),
        headers: { 'Content-Type': 'application/json' },
      })

      const textResponse = await res.text()
      const response = json.parse(textResponse)
      const parsedResponse = parseFeeEstimateResponse(response)

      const suggestedMaxFee = stark.estimatedFeeToMaxFee(parsedResponse.overall_fee)

      return {
        ...parsedResponse,
        suggestedMaxFee,
      }

    case 1:
      return account.estimateFee(calls)
  }

  throw 'Invalid transaction version'
}
