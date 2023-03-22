import React, { useCallback } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import { RowCenter } from '@/components/Row'
import Column from '@/components/Column'
import Caret from '@/components/Caret'
import Checkmark from '@/images/checkmark.svg'
import GoogleLogo from '@/images/google-logo.svg'

export const BaseButton = styled.button<{ large?: boolean }>`
  border: none;
  border-radius: ${({ large = false }) => (large ? '4px' : '3px')};
  font-size: 16px;
  min-height: ${({ large = false }) => (large ? '54px' : '40px')};
  padding: 8px 20px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    opacity: 0.9;
  }
`

export const PrimaryButton = styled(BaseButton)`
  background: ${({ theme }) => `radial-gradient(circle, ${theme.primary1} 0, ${theme.primary2} 50%)`};
  color: ${({ theme }) => theme.white};

  &:active {
    background: ${({ theme }) => theme.primary1}e0;
  }

  &:disabled,
  &[disabled] {
    background: ${({ theme }) => theme.bg3};
    color: ${({ theme }) => theme.text2};
    cursor: default;
  }
`

export const SecondaryButton = styled(BaseButton)`
  background: ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.text1};

  &:active {
    background: ${({ theme }) => theme.bg3}e0;
  }

  &:disabled,
  &[disabled] {
    background: ${({ theme }) => theme.bg3};
    color: ${({ theme }) => theme.text2};
    cursor: default;
  }
`

export const IconButton = styled.button<{ alert?: boolean; notifications?: number }>`
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
    width: 20px;
    height: 20px;

    * {
      fill: ${({ theme }) => theme.text1};
    }
  }

  ${({ theme, alert = false }) => alert && theme.before.alert``}
  ${({ theme, notifications = 0 }) => notifications && theme.before.notifications``}
`

export const NavButton = styled(TYPE.body)`
  display: flex;
  padding: 0 20px;
  height: 100%;
  align-items: center;
  transition: 100ms ease background;
  cursor: pointer;

  &.active,
  &:hover {
    background: ${({ theme }) => theme.bg3}80;
  }

  &.active {
    font-weight: 700;
  }
`

export const SidebarNavButton = styled(NavButton)`
  width: 100%;
  height: fit-content;
  padding: 6px 8px 6px 16px;
  border-radius: 3px;

  &.active,
  &:hover {
    background: ${({ theme }) => theme.bg3}40;
  }

  &.active {
    font-weight: 700;
  }
`

export const TabButton = styled(TYPE.body)`
  cursor: pointer;
  color: ${({ theme }) => theme.text2};
  font-weight: 500;

  &.active {
    color: ${({ theme }) => theme.text1};
    font-weight: 700;
  }

  &.active::after {
    content: '';
    display: block;
    margin-top: 6px;
    height: 2px;
    width: 100%;
    background: ${({ theme }) => theme.primary1};
    border-radius: 2px;
    padding: 0 8px;
    margin-left: -8px;
  }
`

// More complex components

const StyledRowButton = styled.button`
  border: none;
  outline: none;
  background: transparent;
  display: inline-block;
  cursor: pointer;
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

const StyledBackButton = styled(RowButton)`
  &:hover * {
    text-decoration: underline;
  }

  svg {
    width: 12px;
    height: 12px;
  }
`

export function BackButton(props: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <StyledBackButton {...props}>
      <Caret direction="left" />
      <TYPE.white fontSize={16}>
        <Trans>Back</Trans>
      </TYPE.white>
    </StyledBackButton>
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
    stroke: white;
  }
`

interface RadioButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean
  onChange?: () => void
}

export function RadioButton({ selected, onChange, ...props }: RadioButtonProps) {
  const handleChange = useCallback(() => {
    onChange && onChange()
  }, [onChange])

  return (
    <StyledRadioButton onClick={handleChange} selected={selected} {...props}>
      <Checkmark />
    </StyledRadioButton>
  )
}

const StyledCustomGoogleLogin = styled(BaseButton)`
  background: #3a7af2;
  color: ${({ theme }) => theme.white};
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  &:disabled,
  &[disabled] {
    opacity: 0.8;
  }

  svg {
    height: 24px;
    border-radius: 100%;
    background: #fff;
    border: 4px solid #fff;
    box-sizing: content-box;
  }
`

interface CustomGoogleLoginProps {
  onClick: () => void
  disabled?: boolean
}

export const CustomGoogleLogin = (props: CustomGoogleLoginProps) => {
  return (
    <StyledCustomGoogleLogin {...props}>
      <GoogleLogo />
      <Trans>Connect with google</Trans>
    </StyledCustomGoogleLogin>
  )
}

const StyledThirdPartyButton = styled(SecondaryButton)<{ active: boolean }>`
  display: flex;
  text-align: initial;
  align-items: center;
  padding: 8px 12px 8px 16px;
  border: 1px solid ${({ theme }) => theme.bg3};
  background: ${({ theme }) => theme.bg5};
  gap: 16px;
  height: 60px;
  transition: background 100ms ease;

  svg {
    width: 32px;
  }

  ${({ active, theme }) =>
    active
      ? `
        :hover {
          background: ${theme.bg3};
        }
      `
      : `
        opacity: 0.3;
        cursor: default;
      `}
`

interface ThirdPartyButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  title: string
  subtitle?: string
  disbaled?: boolean
  children: React.HTMLAttributes<HTMLButtonElement>['children']
}

export const ThirdPartyButton = ({ title, subtitle, children, disbaled = false, ...props }: ThirdPartyButtonProps) => {
  return (
    <StyledThirdPartyButton active={!disbaled} {...props}>
      {children}
      <Column gap={4}>
        <TYPE.body>{title}</TYPE.body>
        {subtitle && (
          <TYPE.subtitle fontWeight={400} fontSize={12}>
            {subtitle}
          </TYPE.subtitle>
        )}
      </Column>
    </StyledThirdPartyButton>
  )
}
