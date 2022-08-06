import JSBI from 'jsbi'

export const BIG_INT_UINT126_HIGH_FACTOR = JSBI.exponentiate(JSBI.BigInt(256), JSBI.BigInt(16))

export const EMAIL_VERIFICATION_CODE_LENGTH = 8
export const TWO_FACTOR_AUTH_CODE_LENGTH = 6
export const EMAIL_VERIFICATION_INTERVAL = process.env.NODE_ENV === 'production' ? 60_000 : 5_000 // 60s | 5s

export const PASSWORD_MIN_LEVENSHTEIN = 4
export const PASSWORD_MIN_LENGTH = 6

export const BLOCK_POLLING = 10_000 // 10s

export const PACK_OPENING_DURATION = 5_000 // 5s
export const PACK_OPENING_FLASH_DURATION = 2_000 // 5s
