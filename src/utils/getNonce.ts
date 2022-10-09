import { number, Account } from 'starknet'

export default async function getNonce(account: Account, transactionVersion: number): Promise<number.BigNumberish> {
  switch (transactionVersion) {
    case 0:
      const { result } = await account.callContract({
        contractAddress: account.address,
        entrypoint: 'get_nonce',
      })
      return number.toHex(number.toBN(result[0]))

    case 1:
      return account.getNonce()
  }
}
