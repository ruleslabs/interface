import { decryptWithPassword, decodeKey } from '@/utils/encryption'

interface RulesPrivateKey {
  iv: string
  salt: string
  encryptedPrivateKey: string
}

export async function decryptRulePrivateKey(rulesPrivateKey: RulesPrivateKey, password: string) {
  const { iv, salt, encryptedPrivateKey } = rulesPrivateKey

  const key = await decryptWithPassword(password, iv, salt, encryptedPrivateKey)
  return decodeKey(key)
}
