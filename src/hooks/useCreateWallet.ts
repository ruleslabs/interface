import { useCallback } from 'react'
import { ec, getChecksumAddress, encode } from 'starknet'

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
    const privateKey = encode.buf2hex(ec.starkCurve.utils.randomPrivateKey())
    const publicKey = encode.buf2hex(ec.starkCurve.getPublicKey(privateKey))

    const salt = generateSalt()
    const iv = generateIV()
    const encodedPrivateKey = encodeKey(getChecksumAddress(`0x${privateKey}`))

    const encryptedPrivateKey = await encryptWithPassword(password, iv, salt, encodedPrivateKey)

    return {
      starkPub: getChecksumAddress(`0x${publicKey}`),
      userKey: { encryptedPrivateKey, salt, iv },
    }
  }, [])
}
