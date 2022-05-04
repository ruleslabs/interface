import React, { useCallback } from 'react'
import styled from 'styled-components'

import Spinner from '@/components/Spinner'

function InputBase({ onUserInput, ...props }: InputProps | SearchBarProps) {
  const handleInput = useCallback(
    (event) => {
      onUserInput(event.target.value)
    },
    [onUserInput]
  )

  return <input onChange={handleInput} {...props} />
}

const InputWrapper = styled.div`
  position: relative;
`

const StyledInput = styled(InputBase)<{ $valid: boolean }>`
  background: ${({ theme }) => theme.bg3}80;
  border: 1px solid ${({ theme, $valid }) => ($valid ? theme.bg3 : theme.error)};
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
  padding: 0 20px;
  height: 55px;
  width: 100%;

  :disabled {
    color: ${({ theme }) => theme.text2};
  }

  :focus {
    outline: ${({ theme }) => theme.primary1} solid 2px;
    outline-offset: -1px;
  }

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

const StyledSearchBar = styled(InputBase)`
  background: ${({ theme }) => theme.bg3};
  border: none;
  border-radius: 3px;
  height: 35px;
  outline: none;
  color: ${({ theme }) => theme.text1};
  padding-left: 16px;
  font-size: 16px;

  &::placeholder {
    color: ${({ theme }) => theme.text1}80;
  }
`

const StyledSpinner = styled(Spinner)`
  position: absolute;
  right: 16px;
  bottom: 12px;
  width: 32px;
  height: 32px;
`

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  $valid?: boolean
  loading?: boolean
  onUserInput: (value: string) => void
}

export default function Input({ $valid = true, loading = false, onUserInput, ...props }: InputProps) {
  return (
    <InputWrapper>
      {loading && <StyledSpinner fill="text2" />}
      <StyledInput onUserInput={onUserInput} $valid={$valid} disabled={loading} {...props} />
    </InputWrapper>
  )
}

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onUserInput: (value: string) => void
}

export function SearchBar({ onUserInput, ...props }: SearchBarProps) {
  return <StyledSearchBar type="text" onUserInput={onUserInput} {...props} />
}
