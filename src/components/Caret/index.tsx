import React from 'react'
import styled, { css } from 'styled-components'

import { CssDirection } from '@/styles/theme'

import CaretRight from '@/images/caret-right.svg'
import FilledCaretRight from '@/images/filled-caret-right.svg'

const CaretStyle = css<{ direction: CssDirection }>`
  transform: rotate(
    ${({ direction }) =>
      (direction === 'left' && '180deg') ||
      (direction === 'right' && '0deg') ||
      (direction === 'top' && '270deg') ||
      (direction === 'bottom' && '90deg')}
  );
`

const StyledCaret = styled(CaretRight)<{ direction: CssDirection }>`
  ${CaretStyle}
`

const StyledFilledCaret = styled(FilledCaretRight)<{ direction: CssDirection }>`
  ${CaretStyle}
`

interface CaretProps extends React.SVGProps<SVGElement> {
  direction: CssDirection
  filled?: boolean
}

export default function Caret({ direction, filled = false, ...props }: CaretProps) {
  const CaretComponent = filled ? StyledFilledCaret : StyledCaret

  return <CaretComponent direction={direction} {...props} />
}
