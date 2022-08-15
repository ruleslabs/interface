import React, { useState, useEffect, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'

import { useCurrentUser } from '@/state/user/hooks'
import Column from '@/components/Column'
import CurrencyInput from '@/components/Input/CurrencyInput'
import { metaMaskHooks, metaMask, desiredChainId } from '@/constants/connectors'
import { TYPE } from '@/styles/theme'
import useRampSdk from '@/hooks/useRampSdk'
import { PrimaryButton, SecondaryButton } from '@/components/Button'
import Separator from '@/components/Separator'
import { useEthereumETHBalance } from '@/state/wallet/hooks'
import tryParseWeiAmount from '@/utils/tryParseWeiAmount'
import { useEthereumStarkgateContract } from '@/hooks/useContract'
import ErrorCard from '@/components/ErrorCard'

import RampIcon from '@/images/ramp.svg'
import MetamaskIcon from '@/images/metamask.svg'

const { useAccount, useChainId } = metaMaskHooks

const StyledSecondaryButton = styled(SecondaryButton)<{ active: boolean }>`
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

interface CustomButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  title: string
  subtitle: string
  children: React.ReactNode
}

const CustomButton = ({ title, subtitle, children, ...props }: CustomButtonProps) => {
  return (
    <StyledSecondaryButton active={!!props.onClick} {...props}>
      {children}
      <Column gap={4}>
        <TYPE.body>{title}</TYPE.body>
        <TYPE.subtitle fontWeight={400} fontSize={12}>
          {subtitle}
        </TYPE.subtitle>
      </Column>
    </StyledSecondaryButton>
  )
}

interface DepositProps {
  onDeposit(amount: string): void
  onError(error: string): void
  onConfirmation(hash: string): void
}

export default function Deposit({ onDeposit, onError, onConfirmation }: DepositProps) {
  const currentUser = useCurrentUser()

  // Ramp
  const rampSdk = useRampSdk({ email: currentUser?.email, address: currentUser?.starknetAddress })

  // metamask
  const account = useAccount()
  const chainId = useChainId()
  const activateMetamask = useCallback(() => metaMask.activate(desiredChainId), [metaMask, desiredChainId])

  // attempt to connect eagerly on mount
  useEffect(() => {
    metaMask.connectEagerly()
  }, [])

  // Deposit
  const [depositAmount, setDepositAmount] = useState('')
  const handleDepositAmountUpdate = useCallback((value: string) => setDepositAmount(value), [setDepositAmount])

  const balance = useEthereumETHBalance(account)
  const parsedDepositAmount = useMemo(() => tryParseWeiAmount(depositAmount), [depositAmount])

  const ethereumStarkgateContract = useEthereumStarkgateContract()
  const handleDeposit = useCallback(() => {
    if (!ethereumStarkgateContract || !parsedDepositAmount || !currentUser?.starknetAddress) return

    console.log(parsedDepositAmount.toSignificant(6))

    onDeposit(parsedDepositAmount.toSignificant(6))

    const estimate = ethereumStarkgateContract.estimateGas.deposit
    const method = ethereumStarkgateContract.deposit
    const args: Array<string | string[] | number> = [currentUser.starknetAddress]
    const value = parsedDepositAmount.quotient.toString()

    estimate(...args, value ? { value } : {})
      .then((estimatedGasLimit) =>
        method(...args, { ...(value ? { value } : {}), gasLimit: estimatedGasLimit }).then((response: any) => {
          onConfirmation(response.hash)
        })
      )
      .catch((error: any) => {
        onError(error.message)
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) console.error(error)
      })
  }, [depositAmount])

  return (
    <Column gap={16}>
      <TYPE.medium>
        <Trans>From your bank account</Trans>
      </TYPE.medium>
      <CustomButton title="Ramp" subtitle={t`Buy ETH with your credit card or a bank transfer`} onClick={rampSdk?.show}>
        <RampIcon />
      </CustomButton>

      <Separator>
        <Trans>or</Trans>
      </Separator>

      <TYPE.medium>
        <Trans>From your Ethereum wallet</Trans>
      </TYPE.medium>

      {account && chainId === desiredChainId ? (
        <Column gap={16}>
          <CurrencyInput
            value={depositAmount}
            placeholder="0.0"
            onUserInput={handleDepositAmountUpdate}
            balance={balance}
          />
          {!+depositAmount || !parsedDepositAmount ? (
            <PrimaryButton disabled large>
              <Trans>Enter an amount</Trans>
            </PrimaryButton>
          ) : balance?.lessThan(parsedDepositAmount) ? (
            <PrimaryButton disabled large>
              <Trans>Insufficient ETH balance</Trans>
            </PrimaryButton>
          ) : (
            <PrimaryButton onClick={handleDeposit} large>
              <Trans>Deposit</Trans>
            </PrimaryButton>
          )}
        </Column>
      ) : account ? (
        <ErrorCard textAlign="center">
          <Trans>
            Metamask connected to the wrong network,
            <br />
            please&nbsp;
            <span onClick={activateMetamask}>switch network</span>
          </Trans>
        </ErrorCard>
      ) : (
        <CustomButton title={t`Connect Metamask`} subtitle={t`Deposit ETH from your wallet`} onClick={activateMetamask}>
          <MetamaskIcon />
        </CustomButton>
      )}
    </Column>
  )
}
