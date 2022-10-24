export function round(val: number, decimals = 0) {
  decimals = 10 ** decimals
  return Math.round(val * decimals) / decimals
}
