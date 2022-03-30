import { useCallback } from 'react'
import styled from 'styled-components'

import { TYPE } from '@/styles/theme'
import { RowCenter } from '@/components/Row'
import Caret from '@/components/Caret'
import Checkmark from '@/images/checkmark.svg'

export const BaseButton = styled.button<{ large?: boolean }>`
  border: none;
  border-radius: ${({ large = false }) => (large ? '4px' : '3px')};
  font-size: 16px;
  height: ${({ large = false }) => (large ? '44px' : '35px')};
  padding: 0 20px;
  cursor: pointer;
  font-weight: 500;
`

export const PrimaryButton = styled(BaseButton)`
  background: ${({ theme }) => theme.primary1};
  color: ${({ theme }) => theme.text1};

  &:active {
    background: ${({ theme }) => theme.primary1}e0;
  }

  &:disabled,
  &[disabled] {
    background: ${({ theme }) => theme.bg3};
    color: ${({ theme }) => theme.text2};
  }
`

export const SecondaryButton = styled(BaseButton)`
  background: ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.text1};

  &:active {
    background: ${({ theme }) => theme.bg3}e0;
  }
`

export const IconButton = styled.button`
  width: 32px;
  height: 32px;
  background-color: ${({ theme }) => theme.bg3};
  cursor: pointer;
  border: none;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  outline: none;

  & > svg {
    width: 18px;
    height: 18px;
  }
`

const StyledRowButton = styled.button`
  border: none;
  outline: none;
  background: transparent;
  display: inline-block;
  cursor: pointer;

  svg {
    width: 12px;
    height: 12px;
  }

  &:hover * {
    text-decoration: underline;
  }
`

interface RowButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export function RowButton({ children, ...props }: RowButtonProps) {
  return (
    <StyledRowButton {...props}>
      <RowCenter gap={8}>{children}</RowCenter>
    </StyledRowButton>
  )
}

export function BackButton(props: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <RowButton {...props}>
      <Caret direction="left" />
      <TYPE.white fontSize={16}>Retour</TYPE.white>
    </RowButton>
  )
}

const StyledRadioButton = styled(RowCenter)<{ selected?: boolean }>`
  background: ${({ theme }) => theme.bg3};
  border: 1px solid ${({ theme }) => theme.bg4};
  border-radius: 50%;
  width: 26px;
  height: 26px;
  cursor: pointer;
  box-sizing: border-box;
  justify-content: center;

  ${({ selected, theme }) =>
    selected
      ? `
        border: none;
        background: ${theme.primary1};
      `
      : `
        svg {
          visibility: hidden;
        }
      `}

  svg {
    width: 16px;
    height: 16px;
  }
`

interface RadioButtonProps {
  selected?: boolean
  onChange?: () => void
}

export function RadioButton({ selected, onChange }: RadioButtonProps) {
  const handleChange = useCallback(() => {
    onChange && onChange()
  }, [onChange])

  return (
    <StyledRadioButton onClick={handleChange} selected={selected}>
      <Checkmark />
    </StyledRadioButton>
  )
}
