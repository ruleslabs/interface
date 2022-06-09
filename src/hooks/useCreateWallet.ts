// eslint-disable-next-line @typescript-eslint/no-var-requires
const CompiledProxyContract = require('../contracts/Proxy.txt').default

import { useCallback } from 'react'
import { stark, ec, hash } from 'starknet'

import { useStarknet } from '@/lib/starknet'
import { encryptWithPassword, encryptWithPublicKey, encodeKey, generateSalt, generateIV } from '@/utils/encryption'
import { ACCOUNT_CLASS_HASH } from '@/constants/addresses'

const spki = process.env.NEXT_PUBLIC_SPKI ?? ''

export interface WalletInfos {
  starknetAddress: string
  userKey: {
    encryptedPrivateKey: string
    salt: string
    iv: string
  }
  backupKey: string
  txHash: string
}

export default function useCreateWallet(): (password: string) => Promise<WalletInfos> {
  const { provider, network } = useStarknet()

  return useCallback(
    async (password: string): Promise<WalletInfos> => {
      const accountClassHash = network ? ACCOUNT_CLASS_HASH[network] : null
      if (!provider || !accountClassHash) throw new Error('Failed to deploy wallet')

      const privateKey = await stark.randomAddress()
      const starkPair = ec.getKeyPair(privateKey)
      const starkPub = ec.getStarkKey(starkPair)

      const deployTransaction = await provider.deployContract({
        contract: CompiledProxyContract,
        constructorCalldata: stark.compileCalldata({
          implementation: accountClassHash,
          selector: hash.getSelectorFromName('initialize'),
          calldata: [starkPub],
        }),
      })

      if (deployTransaction.code !== 'TRANSACTION_RECEIVED' || !deployTransaction.address) {
        throw new Error('Failed to deploy wallet')
      }

      const salt = generateSalt()
      const iv = generateIV()
      const encodedPrivateKey = encodeKey(starkPair.priv.toString(16))

      const encryptedPrivateKey = await encryptWithPassword(password, iv, salt, encodedPrivateKey)
      const encryptedPrivateKeyBackup = await encryptWithPublicKey(spki, encodedPrivateKey)

      return {
        starknetAddress: deployTransaction.address,
        userKey: { encryptedPrivateKey, salt, iv },
        backupKey: encryptedPrivateKeyBackup,
        txHash: deployTransaction.transaction_hash,
      }
    },
    [provider]
  )
}
