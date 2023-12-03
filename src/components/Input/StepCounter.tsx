import { SecondaryButton } from 'src/components/Button'
import { Row } from 'src/theme/components/Flex'
import styled from 'styled-components/macro'

import NumericalInput from './NumericalInput'

const SmallButton = styled(SecondaryButton)<{ glow?: boolean }>`
  font-size: 24px;
  min-height: 40px;
  min-width: 40px;
  color: ${({ theme }) => theme.text1};
  padding: 0 0 3px;

  ${({ theme, glow = false }) =>
    glow &&
    `
      animation: breath 2s ease-out infinite;

      @keyframes breath {
        0% {
          box-shadow: 0 0 4px ${theme.text2};
        }

        50% {
          box-shadow: 0 0 6px ${theme.text1};
        }

        100% {
          box-shadow: 0 0 4px ${theme.text2};
        }
      }
    `}

  &:disabled {
    opacity: 0.2;
    cursor: not-allowed;
    pointer-events: all;
    animation: none;
  }

  &:disabled:hover {
    background: none;
  }
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
    <Row gap="16" width="full" alignItems="normal">
      <SmallButton disabled={value <= min} onClick={onDecrement}>
        -
      </SmallButton>

      <NumericalInput value={value} disabled />

      <SmallButton disabled={value >= max} onClick={onIncrement} glow>
        +
      </SmallButton>
    </Row>
  )
}
