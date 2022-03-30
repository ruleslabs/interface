import React, { useCallback } from 'react'
import styled from 'styled-components'

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
  height: 1rem;
  width: 1rem;
  background-color: ${({ theme }) => theme.bg3};

  &:after {
    content: '';
    position: absolute;
    display: none;
    left: 5px;
    top: 0;
    width: 4px;
    height: 10px;
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
  padding-left: 28px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  & ${CheckboxInput}:checked ~ ${Checkmark}:after {
    display: block;
  }
`

interface CheckboxProps {
  value: boolean
  onChange: () => void
  label?: string
  children?: React.ReactNode
}

export default function Checkbox({ value, onChange, label = '', children }: CheckboxProps) {
  const handleChange = useCallback(() => {
    onChange()
  }, [onChange])

  return (
    <CheckboxLabel>
      {label}
      {children && children}
      <CheckboxInput type="checkbox" checked={value} onChange={handleChange} />
      <Checkmark></Checkmark>
    </CheckboxLabel>
  )
}
