import levenshtein from 'js-levenshtein'
import argon2 from 'argon2'

import { PASSWORD_MIN_LEVENSHTEIN, PASSWORD_MIN_LENGTH } from '@/constants/misc'
import { arrayToHex } from './encryption'

export enum PasswordError {
  PWNED,
  LEVENSHTEIN,
  LENGTH,
}

type ValidationResult = PasswordError | null

async function validatePwned(password: string): Promise<ValidationResult> {
  const bytes = new TextEncoder().encode(password)
  const hashBytes = await crypto.subtle.digest({ name: 'SHA-1' }, bytes)
  const hashHex = arrayToHex(new Uint8Array(hashBytes))
  const prefix = hashHex.slice(0, 5)
  const suffix = hashHex.slice(5)

  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, { mode: 'cors' })

    if (!response.ok) return null
    const data = await response.text()
    const pwned = data.search(suffix.toUpperCase()) > -1
    return pwned ? PasswordError.PWNED : null
  } catch (e) {
    return null
  }
}

function validateDistance(email: string, username: string, password: string): ValidationResult {
  return levenshtein(email.split('@')[0], password) < PASSWORD_MIN_LEVENSHTEIN ||
    levenshtein(username, password) < PASSWORD_MIN_LEVENSHTEIN
    ? PasswordError.LEVENSHTEIN
    : null
}

function validateLength(password: string): ValidationResult {
  return password.length < PASSWORD_MIN_LENGTH ? PasswordError.LENGTH : null
}

export async function validatePassword(email: string, username: string, password: string): Promise<ValidationResult> {
  return validateLength(password) || validateDistance(email, username, password) || validatePwned(password)
}

export async function passwordHasher(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password)
  const hashBytes = await crypto.subtle.digest({ name: 'SHA-512' }, bytes)
  return arrayToHex(new Uint8Array(hashBytes))
}
