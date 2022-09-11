import { parseUnits } from '@ethersproject/units'
import { WeiAmount } from '@rulesorg/sdk-core'

/**
 * Parses a WeiAmount from the passed string.
 * Returns the WeiAmount, or undefined if parsing fails.
 */
export default function tryParseWeiAmount(value?: string): WeiAmount | undefined {
  if (!value) return

  try {
    const typedValueParsed = parseUnits(value, WeiAmount.decimals).toString()
    if (typedValueParsed !== '0') {
      return WeiAmount.fromRawAmount(typedValueParsed)
    }
  } catch (error) {
    // fails if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.error(`Failed to parse input amount: "${value}"`, error)
  }
  return undefined
}
