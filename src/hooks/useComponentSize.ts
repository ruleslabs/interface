import { useEffect, useState, useCallback, RefObject } from 'react'

export default function useComponentRect<T extends HTMLElement>(ref: RefObject<T>) {
  const getRect = useCallback(() => {
    const boundingClientRect = ref?.current?.getBoundingClientRect() ?? {}

    return {
      width: boundingClientRect.width ?? 0,
      height: boundingClientRect.height ?? 0,
      x: boundingClientRect.x ?? 0,
      y: boundingClientRect.y ?? 0,
    }
  }, [ref?.current])

  const [rect, setRect] = useState({ width: 0, height: 0, x: 0, y: 0 })

  useEffect(() => {
    const handleResize = () => {
      setRect(getRect())
    }

    if (ref.current) setRect(getRect())

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [ref])

  return rect
}
