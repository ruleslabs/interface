import styled from 'styled-components'

import Row from '@/components/Row'
import { BaseButton } from '@/components/Button'

const SmallButton = styled(BaseButton)`
  color: ${({ theme }) => theme.text1};
  background: ${({ theme }) => theme.bg5};
  box-shadow: inset 0 4px 4px rgba(255, 255, 255, 0.04);
  width: 46px;
  height: 40px;

  :disabled {
    cursor: default;
    color: ${({ theme }) => theme.text2};
    box-shadow: none;
  }

  :active:enabled {
    box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.02);
  }
`

const NumericalInput = styled.input`
  background: ${({ theme }) => theme.bg3}80;
  border: 1px solid ${({ theme, $valid }) => theme.bg3};
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
      <SmallButton disabled={value <= min} onClick={onDecrement}>
        -
      </SmallButton>
      <NumericalInput value={value} disabled />
      <SmallButton disabled={value >= max} onClick={onIncrement}>
        +
      </SmallButton>
    </Row>
  )
}
