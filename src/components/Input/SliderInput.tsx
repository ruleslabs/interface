import React, { useCallback, useRef, useState } from 'react'
import styled from 'styled-components'

import { RowCenter } from '@/components/Row'
import { TYPE } from '@/styles/theme'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'

const StyledSliderInput = styled(RowCenter)`
  padding: 8px 12px;
  background: ${({ theme }) => theme.bg5};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 2px;
  box-sizing: border-box;
  width: 100%;
  gap: 4px;

  :focus-within {
    outline: ${({ theme }) => theme.primary1} solid 2px;
    outline-offset: -1px;
  }

  & > div:first-child {
    flex-shrink: 0;
  }
`

const Input = styled.input`
  background: transparent;
  border: none;
  font-size: 18px;
  font-weight: 500;
  outline: none;
  width: 100%;
  text-align: right;

  &::placeholder {
    color: ${({ theme }) => theme.text2};
  }

  :-webkit-autofill,
  :-webkit-autofill:focus {
    transition: background-color 600000s 0s, color 600000s 0s;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  -moz-appearance: textfield;
`

interface SliderInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string | number // avoid string[] value
  unit: string
  onUserInput: (value: string) => void
}

export default function SliderInput({ onUserInput, unit, value, ...props }: SliderInputProps) {
  const [ethereumValue, setSlidereumValue] = useState(value)
  const handleInput = useCallback(
    (event) => {
      const value = event?.target?.value
      if (value === '' || /^([0-9]+)$/.test(value)) onUserInput(value)
    },
    [onUserInput]
  )

  // focus
  const inputRef = useRef<HTMLInputElement>(null)
  const setInputFocus = useCallback(() => inputRef.current?.focus(), [inputRef])

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  return (
    <StyledSliderInput onClick={setInputFocus}>
      <Input onChange={handleInput} ref={inputRef} value={value} {...props} />
      <TYPE.medium>{unit}</TYPE.medium>
    </StyledSliderInput>
  )
}
