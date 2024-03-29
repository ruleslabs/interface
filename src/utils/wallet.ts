import { decodeKey, decryptWithPassword } from 'src/utils/encryption'

interface RulesPrivateKey {
  iv: string
  salt: string
  encryptedPrivateKey: string
}

export async function decryptRulesPrivateKey(rulesPrivateKey: RulesPrivateKey, password: string) {
  const { iv, salt, encryptedPrivateKey } = rulesPrivateKey

  const key = await decryptWithPassword(password, iv, salt, encryptedPrivateKey)
  return decodeKey(key)
}
