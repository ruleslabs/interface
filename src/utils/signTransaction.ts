import { transaction, hash, ec, constants, Signer, Signature, KeyPair, InvocationsSignerDetails } from 'starknet'

interface TransactionSignerOptions {
  signer?: Signer
  keyPar?: KeyPair
}

export default async function signTransaction(
  transactions: Call[],
  transactionsDetail: InvocationsSignerDetails,
  transactionVersion: number,
  options: TransactionSignerOptions
): Promise<Signature> {
  switch (transactionVersion) {
    case 0:
      if (!options.keyPair) throw 'Failed to sign transaction: No keyPair provided'

      const calldata = transaction.fromCallsToExecuteCalldataWithNonce(transactions, transactionsDetail.nonce)

      const msgHash = hash.calculateTransactionHashCommon(
        constants.TransactionHashPrefix.INVOKE,
        transactionsDetail.version,
        transactionsDetail.walletAddress,
        hash.getSelectorFromName('__execute__'),
        calldata,
        transactionsDetail.maxFee,
        transactionsDetail.chainId
      )

      return ec.sign(options.keyPair, msgHash)

    case 1:
      if (!options.signer) throw 'Failed to sign transaction: No signer provided'

      return options.signer.signTransaction(transactions, transactionsDetail)
  }
}
