import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'

import useComponentSize from '@/hooks/useComponentSize'

const MAX_WIDTH = 350
const GAP = 32

const StyledGrid = styled.div<{ cols: number; gap: number }>`
  display: grid;
  grid-template-columns: repeat(${({ cols }) => cols}, 1fr);
  justify-content: space-between;
  gap: ${({ gap }) => gap}px;
`

interface GridProps {
  children: React.ReactNode
  gap?: number
  maxWidth?: number
}

export default function Grid({ children, maxWidth = MAX_WIDTH, gap = GAP }: GridProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [cols, setCols] = useState(0)
  const { width: gridWidth } = useComponentSize(gridRef)

  useEffect(() => {
    setCols(gridWidth ? Math.ceil((gridWidth + gap) / (maxWidth + gap)) : 0)
  }, [setCols, gridWidth])

  return (
    <StyledGrid ref={gridRef} cols={cols} gap={gap}>
      {cols && children}
    </StyledGrid>
  )
}
