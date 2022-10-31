import { useLayoutEffect, useState } from 'react'

import { round } from '@/utils/math'
import useWindowSize from '@/hooks/useWindowSize'

export default function useCardModel3DFullscreen(fullscreen: boolean, target?: HTMLDivElement, options: any = {}) {
  // window size
  const windowSize = useWindowSize()

  // state
  const [translation, setTranslation] = useState<any>({})
  const [scale, setScale] = useState(1)
  const [cardRect, setCardRect] = useState<any | null>(null)

  useLayoutEffect(() => {
    if (!fullscreen) {
      setTranslation({ tx: 0, ty: 0 })
      setScale(1)
    } else {
      const targetRect = target?.getBoundingClientRect()
      if (!targetRect || !windowSize?.width || !windowSize?.height) return

      const scaleX = (windowSize.width - (options.margin[1] ?? 0) * 2) / targetRect.width
      const scaleY = (windowSize.height - (options.margin[0] ?? 0) * 2) / targetRect.height

      // scale
      const scale = round(Math.min(scaleX, scaleY, options.maxScale ?? 999999), 3)

      // card Rect
      const width = targetRect.width * scale
      const height = targetRect.height * scale
      const x = windowSize.width / 2 - width / 2
      const y = windowSize.height / 2 - height / 2

      setCardRect({ width, height, x, y })

      setScale(scale)

      setTranslation({
        tx: round(windowSize.width / 2 - targetRect.x - targetRect.width / 2),
        ty: round(windowSize.height / 2 - targetRect.y - targetRect.height / 2),
      })
    }
  }, [fullscreen, windowSize.width, windowSize.height, target?.offsetWidth, target?.offsetHeight])

  return { translation, scale, cardRect }
}
