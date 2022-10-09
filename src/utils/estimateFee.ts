import urljoin from 'url-join'
import {
  number,
  transaction,
  hash,
  stark,
  json,
  ec,
  constants,
  Account,
  EstimateFee,
  EstimateFeeResponse,
  Sequencer,
  KeyPair,
} from 'starknet'

import getNonce from './getNonce'

const feeTransactionVersionBase = number.toBN(2).pow(number.toBN(128))

function parseFeeEstimateResponse(res: Sequencer.EstimateFeeResponse): EstimateFeeResponse {
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
      const url = urljoin('https://alpha4.starknet.io/feeder_gateway', 'estimate_fee?blockNumber=pending')

      const transactions = Array.isArray(calls) ? calls : [calls]
      const nonce = await getNonce(account, transactionVersion)

      const calldata = transaction.fromCallsToExecuteCalldataWithNonce(transactions, nonce)

      const msgHash = hash.calculateTransactionHashCommon(
        constants.TransactionHashPrefix.INVOKE,
        feeTransactionVersion,
        account.address,
        hash.getSelectorFromName('__execute__'),
        calldata,
        constants.ZERO,
        account.chainId
      )

      const signature = ec.sign(keyPair, msgHash)

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
}
