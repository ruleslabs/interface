import { useCallback } from 'react'
import { ec, getChecksumAddress, encode, hash, CallData } from 'starknet'

import { encryptWithPassword, encodeKey, generateSalt, generateIV } from 'src/utils/encryption'
import { constants } from '@rulesorg/sdk-core'

export default function useCreateWallet() {
  return useCallback(async (password: string) => {
    // generate keys
    const privateKey = encode.buf2hex(ec.starkCurve.utils.randomPrivateKey())
    const publicKey = ec.starkCurve.getStarkKey(privateKey)

    const salt = generateSalt()
    const iv = generateIV()
    const encodedPrivateKey = encodeKey(getChecksumAddress(`0x${privateKey}`))

    const encryptedPrivateKey = await encryptWithPassword(password, iv, salt, encodedPrivateKey)

    // compute deterministic address
    const address = hash.calculateContractAddressFromHash(
      publicKey, // salt
      constants.ACCOUNT_CLASS_HASH,
      CallData.compile({ publicKey }),
      0
    )

    return {
      publicKey: getChecksumAddress(publicKey),
      address,
      rulesPrivateKey: { encryptedPrivateKey, salt, iv },
    }
  }, [])
}
