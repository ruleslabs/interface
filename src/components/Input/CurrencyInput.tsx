import React, { useCallback, useRef } from 'react'
import styled from 'styled-components'
import { WeiAmount } from '@rulesorg/sdk-core'
import { Trans } from '@lingui/macro'

import Row, { RowCenter } from '@/components/Row'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'

import EthereumIcon from '@/images/ethereum.svg'

const StyledCurrencyInput = styled(Column)`
  padding: 16px;
  background: ${({ theme }) => theme.bg5};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 4px;
  box-sizing: border-box;
  width: 100%;
  gap: 16px;

  :focus-within {
    outline: ${({ theme }) => theme.primary1} solid 2px;
    outline-offset: -1px;
  }

  & > div {
    width: 100%;
  }
`

const Input = styled.input`
  background: transparent;
  border: none;
  font-size: 24px;
  font-family: 'Roboto Mono', monospace;
  outline: none;
  width: 100%;

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

const Currency = styled(RowCenter)`
  gap: 8px;
  background: ${({ theme }) => theme.bg3};
  padding: 6px 12px;
  border-radius: 4px;

  svg {
    width: 20px;
  }
`

interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onUserInput: (value: string) => void
  balance?: WeiAmount
}

export default function CurrencyInput({ onUserInput, balance, ...props }: CurrencyInputProps) {
  const handleInput = useCallback(
    (event) => {
      const value = event?.target?.value?.replace(',', '.')
      if (value === '' || /^([0-9]+\.?[0-9]*|\.[0-9]+)$/.test(value)) onUserInput(value)
    },
    [onUserInput]
  )

  const inputRef = useRef<HTMLInputElement>(null)
  const setInputFocus = useCallback(() => inputRef.current?.focus(), [inputRef])

  return (
    <StyledCurrencyInput onClick={setInputFocus}>
      <Row gap={8}>
        <Input onChange={handleInput} ref={inputRef} {...props} />
        <Currency>
          <EthereumIcon />
          <TYPE.body>ETH</TYPE.body>
        </Currency>
      </Row>
      <TYPE.subtitle textAlign="right">
        <Trans>Balance: {balance?.toFixed(4) ?? 0}</Trans>
      </TYPE.subtitle>
    </StyledCurrencyInput>
  )
}
