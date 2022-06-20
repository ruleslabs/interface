import { useCallback } from 'react'
import { stark, ec } from 'starknet'

import { encryptWithPassword, encodeKey, generateSalt, generateIV } from '@/utils/encryption'

export interface WalletInfos {
  starkPub: string
  userKey: {
    encryptedPrivateKey: string
    salt: string
    iv: string
  }
}

export default function useCreateWallet(): (password: string) => Promise<WalletInfos> {
  return useCallback(async (password: string): Promise<WalletInfos> => {
    const privateKey = await stark.randomAddress()
    const starkPair = ec.getKeyPair(privateKey)
    const starkPub = ec.getStarkKey(starkPair)

    const salt = generateSalt()
    const iv = generateIV()
    const encodedPrivateKey = encodeKey(starkPair.priv.toString(16))

    const encryptedPrivateKey = await encryptWithPassword(password, iv, salt, encodedPrivateKey)

    return {
      starkPub,
      userKey: { encryptedPrivateKey, salt, iv },
    }
  }, [])
}
