import { Buffer } from 'buffer'

export const DECRYPTION_ERROR = 'DecryptionError'

export class DecryptionError extends Error {
  constructor(message?: string) {
    super(message || 'Invalid password')
    this.name = DECRYPTION_ERROR
  }
}

// AES

async function deriveKeyFromPassword(password: string, salt: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey'])

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: Buffer.from(salt, 'base64'),
      iterations: 50_000,
      hash: { name: 'SHA-256' },
    },
    key,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptWithPassword(password: string, iv: string, salt: string, message: Uint8Array) {
  const key = await deriveKeyFromPassword(password, salt)

  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: Buffer.from(iv, 'base64'), tagLength: 128 },
    key,
    message
  )

  return Buffer.from(new Uint8Array(cipher)).toString('base64')
}

export async function decryptWithPassword(password: string, iv: string, salt: string, cipher: string) {
  const data = Buffer.from(cipher, 'base64')
  const key = await deriveKeyFromPassword(password, salt)

  try {
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: Buffer.from(iv, 'base64'), tagLength: 128 },
      key,
      data
    )
    return new Uint8Array(decryptedData)
  } catch (e) {
    throw new DecryptionError()
  }
}

// Utils

export function generateIV() {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(12))).toString('base64')
}

export function generateSalt() {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64')
}

export function encodeKey(key: string): Uint8Array {
  return hexToArray(key.substring(2))
}

export function decodeKey(key: Uint8Array): string {
  return `0x${arrayToHex(key)}`
}

export const hexToArray = (hex: string): Uint8Array => new Uint8Array(Buffer.from(hex, 'hex'))

export const arrayToHex = (array: Uint8Array): string => Buffer.from(array).toString('hex')
