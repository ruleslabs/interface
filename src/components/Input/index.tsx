import React, { useCallback } from 'react'
import styled from 'styled-components'

function InputBase({ onUserInput, ...props }: InputProps | SearchBarProps) {
  const handleInput = useCallback(
    (event) => {
      onUserInput(event.target.value)
    },
    [onUserInput]
  )

  return <input onChange={handleInput} {...props} />
}

const StyledInput = styled(InputBase)<{ valid: boolean }>`
  background: ${({ theme, valid }) => (valid ? `${theme.bg3}80` : `${theme.red}20`)};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
  padding: 0 20px;
  height: 55px;

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

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  onUserInput: (value: string) => void
}

export default function Input({ error, onUserInput, ...props }: InputProps) {
  return <StyledInput onUserInput={onUserInput} valid={!error} {...props} />
}

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onUserInput: (value: string) => void
}

export function SearchBar({ onUserInput, ...props }: SearchBarProps) {
  return <StyledSearchBar type="text" onUserInput={onUserInput} {...props} />
}
