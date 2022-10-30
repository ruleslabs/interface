export function round(val: number, decimals = 0) {
  decimals = 10 ** decimals
  return Math.round(val * decimals) / decimals
}

export function range(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}
