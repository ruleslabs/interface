// https://github.com/Uniswap/interface/blob/d9f14025768f4bf8c279d15042e7bce557c9db2f/src/hooks/useIsWindowVisible.ts
import { useCallback, useEffect, useState } from 'react'

function isVisibilityStateSupported() {
  return 'visibilityState' in document
}

function isWindowVisible() {
  return !isVisibilityStateSupported() || document.visibilityState !== 'hidden'
}

/**
 * Returns whether the window is currently visible to the user.
 */
export default function useIsWindowVisible(): boolean {
  const [focused, setFocused] = useState<boolean>(false)
  const listener = useCallback(() => {
    setFocused(isWindowVisible())
  }, [setFocused])

  useEffect(() => {
    if (!isVisibilityStateSupported()) return undefined
    setFocused(() => isWindowVisible())

    document.addEventListener('visibilitychange', listener)
    return () => {
      document.removeEventListener('visibilitychange', listener)
    }
  }, [listener])

  return focused
}
