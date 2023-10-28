import React, { useCallback } from 'react'
import styled from 'styled-components/macro'

const StyledNumericalInput = styled.input`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.bg3}80;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  min-width: 46px;
  max-width: 80px;
  outline-offset: -1px;
  outline-color: ${({ theme }) => theme.primary1};
  outline-style: solid;
  outline-width: 0;

  &:hover {
    outline-width: 1px;
  }

  &:focus,
  &:active {
    outline-width: 2px;
  }
`

interface SliderInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string | number // avoid string[] value
  onUserInput?: (value: string) => void
}

export default function NumericalInput({ onUserInput, value, ...props }: SliderInputProps) {
  const handleInput = useCallback(
    (event) => {
      if (!onUserInput) return

      const value = event?.target?.value
      if (value === '' || /^([0-9]+)$/.test(value)) onUserInput(value)
    },
    [onUserInput]
  )

  return <StyledNumericalInput onChange={handleInput} value={value} {...props} />
}
