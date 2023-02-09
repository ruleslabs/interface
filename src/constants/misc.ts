import JSBI from 'jsbi'

export const BIG_INT_UINT126_HIGH_FACTOR = JSBI.exponentiate(JSBI.BigInt(256), JSBI.BigInt(16))

export const EMAIL_VERIFICATION_CODE_LENGTH = 8
export const TWO_FACTOR_AUTH_CODE_LENGTH = 6
export const EMAIL_VERIFICATION_INTERVAL = process.env.NODE_ENV === 'production' ? 60_000 : 5_000 // 60s | 5s

export const PASSWORD_MIN_LEVENSHTEIN = 4
export const PASSWORD_MIN_LENGTH = 6

export const BLOCK_POLLING = 10_000 // 10s
export const ETH_PRICE_POLLING = 60_000 // 60s

export const PACK_OPENING_DURATION = 5_000 // 5s
export const PACK_OPENING_FLASH_DURATION = 2_000 // 5s

export const ARTIST_FEE_PERCENTAGE = 25_000 // 2.5%
export const MARKETPLACE_FEE_PERCENTAGE = 25_000 // 2.5%
export const BIG_INT_MIN_MARKETPLACE_OFFER_PRICE = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(13))
export const BIG_INT_MAX_MARKETPLACE_OFFER_PRICE = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(26))

export const CARD_ASPECT_RATIO = 1488 / 1062

export const RULEDEX_LOW_SERIAL_MAXS: { [scarcityName: string]: number } = {
  Common: 100,
  Platinium: 20,
  Halloween: 100,
}

export const RULEDEX_CARDS_COUNT_LEVELS_MINS = [5, 10, 20, 50]

export const NULL_PRICE = '0000000000000000000000'

export const MAX_SHORT_USERNAME_LENGTH = 14
