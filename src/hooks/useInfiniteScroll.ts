import { useCallback, useRef } from 'react'

interface InfiniteScrollProps {
  nextPage?: () => void
  loading: boolean
}

export default function useInfiniteScroll({ nextPage, loading }: InfiniteScrollProps) {
  const observer = useRef<IntersectionObserver | null>(null)
  const lastTxRef = useCallback(
    (node: any) => {
      if (!nextPage || loading) return
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) nextPage()
      })
      if (node) observer.current.observe(node)
    },
    [loading, nextPage]
  )

  return lastTxRef
}
