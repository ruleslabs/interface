import { Trans } from '@lingui/macro'
import { WeiAmount } from '@rulesorg/sdk-core'
import React, { useCallback, useRef } from 'react'
import Column from 'src/components/Column'
import Row, { RowCenter } from 'src/components/Row'
import { ReactComponent as EthereumIcon } from 'src/images/ethereum.svg'
import { ReactComponent as StarknetTokenIcon } from 'src/images/starknetToken.svg'
import { TYPE } from 'src/styles/theme'
import styled from 'styled-components/macro'

const StyledCurrencyInput = styled(Column)`
  padding: 16px;
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 6px;
  box-sizing: border-box;
  width: 100%;
  gap: 16px;

  &:focus-within {
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
  font-family: Inconsolata, monospace;
  outline: none;
  width: 100%;

  &::placeholder {
    color: ${({ theme }) => theme.text2};
  }

  &:-webkit-autofill,
  &:-webkit-autofill:focus {
    transition: background-color 600000s 0s, color 600000s 0s;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  -moz-appearance: textfield;
`

const Currency = styled(RowCenter)`
  gap: 8px;
  background: ${({ theme }) => theme.bg3};
  padding: 6px 12px;
  border-radius: 6px;

  svg {
		width: auto;
    height: 24px;
  }
`

interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onUserInput: (value: string) => void
  balance?: WeiAmount
  currency: "ETH"|"STRK"
  onCurrencyChange: () => void
}

export default function CurrencyInput({ onUserInput, balance, currency, onCurrencyChange, ...props }: CurrencyInputProps) {
  const handleInput = useCallback(
    (event) => {
      const value = event?.target?.value?.replace(',', '.')
      if (value === '' || /^([0-9]{1,10}\.[0-9]{0,18}|[0-9]{1,10}\.?)$/.test(value)) {
        onUserInput(value)
      }
    },
    [onUserInput]
  )

  const inputRef = useRef<HTMLInputElement>(null)
  const setInputFocus = useCallback(() => inputRef.current?.focus(), [inputRef])

  return (
    <StyledCurrencyInput onClick={setInputFocus}>
      <Row gap={8}>
        <Input onChange={handleInput} ref={inputRef} {...props} />
        <Currency onClick={onCurrencyChange}>
					{currency === 'ETH' ? (<EthereumIcon />) : (<StarknetTokenIcon />)}
          <TYPE.body>{currency}</TYPE.body>
        </Currency>
      </Row>
      <TYPE.subtitle textAlign="right">
        <Trans>Balance: {balance?.toSignificant(6) ?? 0}</Trans>
      </TYPE.subtitle>
    </StyledCurrencyInput>
  )
}
