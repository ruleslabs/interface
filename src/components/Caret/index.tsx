import React from 'react'
import { ReactComponent as CaretRight } from 'src/images/caret-right.svg'
import { ReactComponent as FilledCaretRight } from 'src/images/filled-caret-right.svg'
import { CssDirection } from 'src/styles/theme'
import styled, { css } from 'styled-components/macro'

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

interface CaretProps extends Omit<React.SVGProps<SVGSVGElement>, 'ref'> {
  direction: CssDirection
  filled?: boolean
}

export default function Caret({ filled = false, ...props }: CaretProps) {
  const CaretComponent = filled ? StyledFilledCaret : StyledCaret

  return <CaretComponent {...props} />
}
