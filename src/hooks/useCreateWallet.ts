// eslint-disable-next-line @typescript-eslint/no-var-requires
const CompiledAccountContract = require('../contracts/Account.txt').default

import { useCallback } from 'react'
import { stark, ec } from 'starknet'

import { useStarknet } from '@/starknet'
import { encryptWithPassword, encryptWithPublicKey, encodeKey, generateSalt, generateIV } from '@/utils/encryption'

const spki = process.env.NEXT_PUBLIC_SPKI ?? ''

const network = process.env.NEXT_PUBLIC_STARKNET_NETWORK_ID ?? ''

export default function useCreateWallet() {
  const { library } = useStarknet()

  return useCallback(
    async (password: string) => {
      if (!library) return

      const privateKey = await stark.randomAddress()
      const starkPair = ec.getKeyPair(privateKey)
      const starkPub = ec.getStarkKey(starkPair)

      const deployTransaction = await library.deployContract({
        contract: CompiledAccountContract,
        constructorCalldata: stark.compileCalldata({ public_key: starkPub }),
      })

      if (deployTransaction.code !== 'TRANSACTION_RECEIVED' || !deployTransaction.address) {
        throw new Error('Deploy transaction failed')
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
      }
    },
    [library]
  )
}
