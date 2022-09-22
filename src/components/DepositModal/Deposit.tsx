import React, { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'

import { useCurrentUser } from '@/state/user/hooks'
import Column from '@/components/Column'
import CurrencyInput from '@/components/Input/CurrencyInput'
import { metaMaskHooks } from '@/constants/connectors'
import { TYPE } from '@/styles/theme'
import useRampSdk from '@/hooks/useRampSdk'
import { PrimaryButton, ThirdPartyButton } from '@/components/Button'
import Separator from '@/components/Separator'
import { useEthereumETHBalance } from '@/state/wallet/hooks'
import tryParseWeiAmount from '@/utils/tryParseWeiAmount'
import { useEthereumStarkgateContract } from '@/hooks/useContract'
import Wallet from '@/components/Wallet'
import Metamask from '@/components/Metamask'

import Arrow from '@/images/arrow.svg'
import RampIcon from '@/images/ramp.svg'

const { useAccount, useChainId } = metaMaskHooks

const ArrowWrapper = styled(Column)`
  width: 36px;
  height: 36px;
  background: ${({ theme }) => theme.bg5};
  box-shadow: 0px 0px 5px ${({ theme }) => theme.bg1};
  justify-content: center;
  border-radius: 50%;
  position: relative;
  margin: -6px auto;

  & svg {
    margin: 0 auto;
    width: 22px;
    height: 22px;
    fill: ${({ theme }) => theme.text1};
    transform: rotate(90deg);
  }
`

interface DepositProps {
  onDeposit(amount: string): void
  onError(error: string): void
  onConfirmation(hash: string): void
}

export default function Deposit({ onDeposit, onError, onConfirmation }: DepositProps) {
  // current user
  const currentUser = useCurrentUser()

  // Ramp
  const rampSdk = useRampSdk({ email: currentUser?.email, address: currentUser?.starknetWallet.address })

  // metamask
  const account = useAccount()
  const chainId = useChainId()

  // Deposit
  const [depositAmount, setDepositAmount] = useState('')
  const handleDepositAmountUpdate = useCallback((value: string) => setDepositAmount(value), [setDepositAmount])

  const balance = useEthereumETHBalance(account)
  const parsedDepositAmount = useMemo(() => tryParseWeiAmount(depositAmount), [depositAmount])

  const ethereumStarkgateContract = useEthereumStarkgateContract()
  const handleDeposit = useCallback(() => {
    if (!ethereumStarkgateContract || !parsedDepositAmount || !currentUser?.starknetWallet.address) return

    onDeposit(parsedDepositAmount.toSignificant(6))

    const estimate = ethereumStarkgateContract.estimateGas.deposit
    const method = ethereumStarkgateContract.deposit
    const args: Array<string | string[] | number> = [currentUser.starknetWallet.address]
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

  // next step check
  const canDeposit = useMemo(
    () => +depositAmount && parsedDepositAmount && balance && !balance.lessThan(parsedDepositAmount),
    [depositAmount, parsedDepositAmount, balance]
  )

  return (
    <Column gap={32}>
      <Column gap={16}>
        <TYPE.medium>
          <Trans>From your bank account</Trans>
        </TYPE.medium>

        <ThirdPartyButton
          title="Ramp"
          subtitle={t`Buy ETH with your credit card or a bank transfer`}
          onClick={rampSdk?.show}
        >
          <RampIcon />
        </ThirdPartyButton>
      </Column>

      <Separator>
        <Trans>or</Trans>
      </Separator>

      <Column gap={16}>
        <TYPE.medium>
          <Trans>From your Ethereum wallet</Trans>
        </TYPE.medium>

        <Metamask>
          <Column>
            <CurrencyInput
              value={depositAmount}
              placeholder="0.0"
              onUserInput={handleDepositAmountUpdate}
              balance={balance}
            />

            <ArrowWrapper>
              <Arrow />
            </ArrowWrapper>

            <Wallet layer={2} />
          </Column>

          <PrimaryButton onClick={handleDeposit} disabled={!canDeposit} large>
            {!+depositAmount || !parsedDepositAmount ? (
              <Trans>Enter an amount</Trans>
            ) : balance?.lessThan(parsedDepositAmount) ? (
              <Trans>Insufficient ETH balance</Trans>
            ) : (
              <Trans>Next</Trans>
            )}
          </PrimaryButton>
        </Metamask>
      </Column>
    </Column>
  )
}
