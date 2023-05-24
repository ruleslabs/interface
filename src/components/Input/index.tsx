import React, { useCallback } from 'react'
import styled from 'styled-components'

import { RowCenter } from '@/components/Row'
import Spinner from '@/components/Spinner'
import { TYPE } from '@/styles/theme'

function InputBase({ onUserInput, ...props }: InputProps | SearchBarProps) {
  const handleInput = useCallback(
    (event) => {
      onUserInput(event.target.value)
    },
    [onUserInput]
  )

  return <input onChange={handleInput} {...props} />
}

const InputWrapper = styled(RowCenter)<{ prefixed: boolean; $valid: boolean }>`
  position: relative;
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme, $valid }) => ($valid ? theme.bg3 : theme.error)};
  border-radius: 6px;
  box-sizing: border-box;
  padding: ${({ prefixed }) => (prefixed ? '0 20px 0 12px' : '0 20px')};

  :focus-within {
    outline: ${({ theme }) => theme.primary1} solid 2px;
    outline-offset: -1px;
  }
`

const StyledInput = styled(InputBase)`
  border: none;
  background: transparent;
  font-size: 16px;
  width: 100%;
  outline: none;
  height: 55px;

  :disabled {
    color: ${({ theme }) => theme.text2};
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
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 6px;
  height: 40px;
  outline: none;
  color: ${({ theme }) => theme.text1};
  padding-left: 16px;
  font-size: 16px;

  &::placeholder {
    color: ${({ theme }) => theme.text1}80;
  }
`

const StyledSmallInput = styled(InputBase)`
  background: ${({ theme }) => theme.black}40;
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 6px;
  height: 32px;
  outline: none;
  color: ${({ theme }) => theme.text1};
  padding: 4px 12px;
  font-size: 16px;

  &::placeholder {
    color: ${({ theme }) => theme.text1}80;
  }

  :focus {
    border-color: ${({ theme }) => theme.primary1};
  }

  :focus-visible {
    box-shadow: inset 0 0 0 1px ${({ theme }) => theme.primary1};
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
  prefix?: string
}

export default function Input({
  $valid = true,
  loading = false,
  prefix,
  onUserInput,
  className,
  ...props
}: InputProps) {
  return (
    <InputWrapper $valid={$valid} prefixed={!!prefix} className={className}>
      {prefix && <TYPE.subtitle>{prefix}&nbsp;</TYPE.subtitle>}
      {loading && <StyledSpinner fill="text2" />}
      <StyledInput onUserInput={onUserInput} disabled={loading} {...props} />
    </InputWrapper>
  )
}

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onUserInput: (value: string) => void
}

export function SearchBar({ onUserInput, ...props }: SearchBarProps) {
  return <StyledSearchBar type="text" onUserInput={onUserInput} {...props} />
}

export function SmallInput({ onUserInput, ...props }: SearchBarProps) {
  return <StyledSmallInput type="text" onUserInput={onUserInput} {...props} />
}
