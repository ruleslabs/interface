import React from 'react'
import styled, { css } from 'styled-components'

import CaretRight from '@/images/caret-right.svg'
import FilledCaretRight from '@/images/filled-caret-right.svg'

type Direction = 'left' | 'right' | 'bottom' | 'top'

const CaretStyle = css<{ direction: Direction }>`
  transform: rotate(
    ${({ direction }) =>
      (direction === 'left' && '180deg') ||
      (direction === 'right' && '0deg') ||
      (direction === 'top' && '270deg') ||
      (direction === 'bottom' && '90deg')}
  );
`

const StyledCaret = styled(CaretRight)<{ direction: Direction }>`
  ${CaretStyle}
`

const StyledFilledCaret = styled(FilledCaretRight)<{ direction: Direction }>`
  ${CaretStyle}
`

interface CaretProps extends React.SVGProps<SVGElement> {
  direction: Direction
  filled?: boolean
}

export default function Caret({ direction, filled = false, ...props }: CaretProps) {
  const CaretComponent = filled ? StyledFilledCaret : StyledCaret

  return <CaretComponent direction={direction} {...props} />
}
