import { constants } from '@rulesorg/sdk-core'
import { useCallback } from 'react'
import { encodeKey, encryptWithPassword, generateIV, generateSalt } from 'src/utils/encryption'
import { CallData, ec, encode, getChecksumAddress, hash } from 'starknet'

export function useGetWalletConstructorCallData() {
  const guardianPublicKey = process.env.REACT_APP_GUARDIAN_PUBLIC_KEY
  if (!guardianPublicKey) throw 'Missing REACT_APP_GUARDIAN_PUBLIC_KEY env'

  return useCallback((publicKey: string) => CallData.compile({ signer: publicKey, guardian: guardianPublicKey }), [])
}

export default function useCreateWallet() {
  const getWalletConstructorCallData = useGetWalletConstructorCallData()

  return useCallback(
    async (password: string) => {
      // generate keys
      const privateKey = encode.buf2hex(ec.starkCurve.utils.randomPrivateKey())
      const publicKey = ec.starkCurve.getStarkKey(privateKey)

      const salt = generateSalt()
      const iv = generateIV()
      const encodedPrivateKey = encodeKey(getChecksumAddress(encode.addHexPrefix(privateKey)))

      const encryptedPrivateKey = await encryptWithPassword(password, iv, salt, encodedPrivateKey)

      // compute deterministic address
      const address = hash.calculateContractAddressFromHash(
        publicKey, // salt
        constants.ACCOUNT_CLASS_HASH,
        getWalletConstructorCallData(publicKey),
        0
      )

      return {
        publicKey,
        address,
        rulesPrivateKey: { encryptedPrivateKey, salt, iv },
      }
    },
    [getWalletConstructorCallData]
  )
}
