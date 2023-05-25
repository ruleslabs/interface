import React, { useCallback } from 'react'
import styled from 'styled-components/macro'

const CheckboxInput = styled.input`
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
`

const Checkmark = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  height: 24px;
  width: 24px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.bg3};
  background-color: ${({ theme }) => theme.bg4};

  &:after {
    content: '';
    position: absolute;
    display: none;
    left: 8px;
    top: 2px;
    width: 6px;
    height: 12px;
    border: solid white;
    border-width: 0 3px 3px 0;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
  }
`

const CheckboxLabel = styled.label`
  display: block;
  position: relative;
  padding: 3px 0 0 36px;
  min-height: 24px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  & ${CheckboxInput}:checked ~ ${Checkmark} {
    background: ${({ theme }) => theme.primary1};
    border-width: 0;
  }

  & ${CheckboxInput}:checked ~ ${Checkmark}:after {
    display: block;
  }
`

interface CheckboxProps {
  value: boolean
  onChange: () => void
  children?: React.ReactNode
}

export default function Checkbox({ value, onChange, children }: CheckboxProps) {
  const handleChange = useCallback(() => {
    onChange()
  }, [onChange])

  return (
    <CheckboxLabel>
      {children}
      <CheckboxInput type="checkbox" checked={value} onChange={handleChange} />
      <Checkmark></Checkmark>
    </CheckboxLabel>
  )
}
