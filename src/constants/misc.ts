import JSBI from 'jsbi'

export const BIG_INT_UINT126_HIGH_FACTOR = JSBI.exponentiate(JSBI.BigInt(256), JSBI.BigInt(16))

export const EMAIL_VERIFICATION_CODE_LENGTH = 8
