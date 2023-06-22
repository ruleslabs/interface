import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { animated, useSpring } from '@react-spring/web'

import { Row } from 'src/theme/components/Flex'
import Box, { BoxProps } from 'src/theme/components/Box'
import useComponentSize from 'src/hooks/useComponentSize'

interface CarouselProps {
  items: React.ReactNode[]
  itemWith: NonNullable<BoxProps['width']>
  gap?: BoxProps['gap']
  interval: number
}

export default function Carousel({ items, itemWith, gap = '24', interval }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const displayedItems = useMemo(() => {
    if (!items.length) return []

    return [
      items[Math.max(items.length - 2, 0)],
      items[items.length - 1],
      ...items,
      items[0],
      items[Math.min(1, items.length - 1)],
      items[Math.min(2, items.length - 2)],
    ]
  }, [items])

  // offset
  const carrouselRef = useRef<HTMLDivElement>(null)
  const { width: carrouselWidth } = useComponentSize(carrouselRef)

  const offset = useMemo(() => (carrouselWidth - +itemWith) / 2, [carrouselWidth, itemWith])

  // infinite effect
  const onRest = useCallback(() => {
    setCurrentIndex((currentIndex) => (currentIndex >= items.length ? 0 : currentIndex))
  }, [items.length])

  // react spring
  const [styles, api] = useSpring(() => ({
    currentIndex: 0,
    onRest,
  }))

  /* Interpolations */

  // translation
  const translationInterpolation = useCallback(
    (currentIndex) => `
      translateX(-${(currentIndex + 2) * (+itemWith + +gap) - offset}px)
    `,
    [itemWith, gap, offset]
  )

  // automatic sliding
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((currentIndex) => currentIndex + 1)
    }, interval)

    // clear interval on re-render to avoid memory leaks
    return () => clearInterval(intervalId)
  }, [items.length, interval])

  useEffect(() => {
    api({ currentIndex, immediate: !currentIndex })
  }, [currentIndex])

  return (
    <Row
      as={animated.div}
      style={{ transform: styles.currentIndex.to(translationInterpolation) as any }}
      gap={gap}
      ref={carrouselRef}
    >
      {displayedItems.map((item, index) => (
        <Box key={index} minWidth={itemWith}>
          {item}
        </Box>
      ))}
    </Row>
  )
}
