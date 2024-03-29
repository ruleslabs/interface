import React, { useEffect, useRef, useState } from 'react'
import useComponentSize from 'src/hooks/useComponentSize'
import styled from 'styled-components/macro'

const MAX_WIDTH = 240
const GAP = 16

const StyledGrid = styled.div<{ cols: number; gap: number }>`
  display: grid;
  grid-template-columns: repeat(${({ cols }) => cols}, 1fr);
  justify-content: space-between;
  gap: ${({ gap }) => gap}px;
`

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: number
  maxWidth?: number
}

export default function Grid({ children, maxWidth = MAX_WIDTH, gap = GAP, ...props }: GridProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [cols, setCols] = useState(0)
  const { width: gridWidth } = useComponentSize(gridRef)

  useEffect(() => {
    setCols(gridWidth ? Math.ceil((gridWidth + gap) / (maxWidth + gap)) : 0)
  }, [gridWidth])

  return (
    <StyledGrid ref={gridRef} cols={cols} gap={gap} {...props}>
      {!!cols && children}
    </StyledGrid>
  )
}
