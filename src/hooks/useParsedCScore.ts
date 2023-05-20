import { useMemo } from 'react'

interface Options {
  rounded?: boolean
}

const DEFAULT_OPTIONS = {
  rounded: true,
}

export default function useParsedCScore(cScore = 0, options: Options = DEFAULT_OPTIONS) {
  return useMemo(() => {
    return options.rounded
      ? Intl.NumberFormat('en-US', {
          notation: 'compact',
          maximumFractionDigits: 2,
        }).format(cScore)
      : cScore.toLocaleString('en-US')
  }, [cScore, options.rounded])
}
