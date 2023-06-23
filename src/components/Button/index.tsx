import React, { useCallback } from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import clsx from 'clsx'

import { TYPE } from 'src/styles/theme'
import { RowCenter } from 'src/components/Row'
import Caret from 'src/components/Caret'
import { ReactComponent as Checkmark } from 'src/images/checkmark.svg'
import Box, { BoxProps } from 'src/theme/components/Box'
import { Row, Column } from 'src/theme/components/Flex'
import * as styles from './style.css'
import * as Text from 'src/theme/components/Text'
import Link from '../Link'
import { getChainInfo } from 'src/constants/chainInfo'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import { ColumnCenter } from '../Column'

type ButtonProps = Omit<BoxProps, 'as'>

/* Base */

export interface EnlargeableButtonProps extends ButtonProps {
  large?: boolean
}

/* Primary */

export const PrimaryButton = ({ className, large = false, disabled = false, ...props }: EnlargeableButtonProps) => (
  <Box
    as={'button'}
    className={clsx(className, styles.primaryButton({ large, disabled }))}
    disabled={disabled}
    {...props}
  />
)

/* Secondary */

export const SecondaryButton = ({ className, large = false, disabled = false, ...props }: EnlargeableButtonProps) => (
  <Box
    as={'button'}
    className={clsx(className, styles.secondaryButton({ large, disabled }))}
    disabled={disabled}
    {...props}
  />
)

export const IconButton = styled.button<{ $alert?: boolean; notifications?: number; square?: boolean }>`
  width: 32px;
  height: 32px;
  border: 1px solid ${({ theme }) => theme.bg3};
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  outline: none;
  padding: 0;

  ${({ theme, square = false }) =>
    square
      ? `
      border-radius: 6px;
      background: none;
    `
      : `
      border-radius: 50%;
      background: ${theme.bg3}80;
    `}

  &:hover {
    background: ${({ theme }) => theme.bg3}40;
  }

  & > svg {
    width: 20px;
    height: 20px;
    fill: ${({ theme }) => theme.text1};
  }

  ${({ theme, $alert = false }) => $alert && theme.before.alert``}
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
  border-radius: 6px;

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
      <TYPE.body fontWeight={600}>
        <Trans>Back</Trans>
      </TYPE.body>
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

interface CardButtonProps extends BoxProps {
  title: string
  subtitle: string
  icon: () => JSX.Element
  disabled?: boolean
}

export const CardButton = ({ className, title, subtitle, icon, ...props }: CardButtonProps) => {
  return (
    <Box as={'button'} className={clsx(className, styles.cardButton())} {...props}>
      <Row gap={'12'} alignItems={'flex-start'}>
        <Box className={styles.cardButtonIconContainer}>{icon()}</Box>

        <Column gap={'4'}>
          <Text.Body>{title}</Text.Body>

          <Text.Custom fontWeight={'normal'} fontSize={'14'} color={'text2'}>
            {subtitle}
          </Text.Custom>
        </Column>
      </Row>
    </Box>
  )
}

/* Etherscan */

const StyledEtherscanButton = styled(ColumnCenter)`
  width: 100%;
  gap: 16px;

  a {
    max-width: 380px;
    width: 100%;
  }

  button {
    height: 50px;
    width: 100%;
  }
`

interface EtherscanButtonProps {
  txHash: string
}

export const EtherscanButton = ({ txHash }: EtherscanButtonProps) => (
  <StyledEtherscanButton>
    <Link target="_blank" href={`${getChainInfo(rulesSdk.networkInfos.starknetChainId).explorer}tx/${txHash}`}>
      <PrimaryButton large>
        <Trans>See on Starkscan</Trans>
      </PrimaryButton>
    </Link>
  </StyledEtherscanButton>
)
