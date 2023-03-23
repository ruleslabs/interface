import styled from 'styled-components'

import Row from '@/components/Row'
import { IconButton } from '@/components/Button'

const SmallButton = styled(IconButton)`
  font-size: 24px;
  height: 40px;
  width: 40px;
  color: ${({ theme }) => theme.text1};

  :disabled {
    opacity: 0.2;
    cursor: not-allowed;
    pointer-events: all;
  }

  :disabled:hover {
    background: none;
  }
`

const NumericalInput = styled.input`
  background: ${({ theme }) => theme.bg5};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 3px;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  width: 46px;
`

interface InputStepCounterProps {
  value: number
  max: number
  min: number
  onIncrement: () => void
  onDecrement: () => void
}

export default function InputStepCounter({ value, max, min, onIncrement, onDecrement }: InputStepCounterProps) {
  return (
    <Row gap={12}>
      <SmallButton disabled={value <= min} onClick={onDecrement} square>
        -
      </SmallButton>
      <NumericalInput value={value} disabled />
      <SmallButton disabled={value >= max} onClick={onIncrement} square>
        +
      </SmallButton>
    </Row>
  )
}
