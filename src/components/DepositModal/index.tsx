import React, { useState, useEffect, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'

import { useCurrentUser } from '@/state/user/hooks'
import Modal, { ModalHeader } from '@/components/Modal'
import Column from '@/components/Column'
import CurrencyInput from '@/components/Input/CurrencyInput'
import { metaMaskHooks, metaMask, desiredChainId } from '@/constants/connectors'
import { useModalOpen, useDepositModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { TYPE } from '@/styles/theme'
import useRampSdk from '@/hooks/useRampSdk'
import { PrimaryButton, SecondaryButton } from '@/components/Button'
import Separator from '@/components/Separator'
import { useEthereumETHBalance } from '@/state/wallet/hooks'
import tryParseWeiAmount from '@/utils/tryParseWeiAmount'
import { useEthereumStarkgateContract } from '@/hooks/useContract'

import RampIcon from '@/images/ramp.svg'
import MetamaskIcon from '@/images/metamask.svg'

const { useAccount, useChainId } = metaMaskHooks

const StyledDepositModal = styled(Column)`
  width: 546px;
  padding: 26px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 4px;

  ${({ theme }) => theme.media.medium`
    width: 100%;
    height: 100%;
  `}
`

const StyledSecondaryButton = styled(SecondaryButton)`
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

  :hover {
    background: ${({ theme }) => theme.bg3};
  }
`

const WrongNetwork = styled(TYPE.body)`
  background: ${({ theme }) => theme.error}20;
  border-radius: 3px;
  padding: 16px;
  width: 100%;
  text-align: center;

  span {
    text-decoration: underline;
    cursor: pointer;
  }
`

interface CustomButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  title: string
  subtitle: string
  children: React.ReactNode
}

const CustomButton = ({ title, subtitle, children, ...props }: CustomButtonProps) => {
  return (
    <StyledSecondaryButton {...props}>
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

export default function DepositModal() {
  const currentUser = useCurrentUser()

  // modal
  const isOpen = useModalOpen(ApplicationModal.DEPOSIT)
  const toggleDepositModal = useDepositModalToggle()

  // Ramp
  const rampSdk = useRampSdk({ email: currentUser?.email, key: currentUser?.starknetAddress })

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

    const estimate = ethereumStarkgateContract.estimateGas.deposit
    const method = ethereumStarkgateContract.deposit
    const args: Array<string | string[] | number> = [currentUser.starknetAddress]
    const value = parsedDepositAmount.quotient.toString()

    estimate(...args, value ? { value } : {})
      .then((estimatedGasLimit) =>
        method(...args, { ...(value ? { value } : {}), gasLimit: estimatedGasLimit }).then((response: any) => {
          console.log(response)
        })
      )
      .catch((error: any) => {
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) console.error(error)
      })
  }, [depositAmount])

  return (
    <Modal onDismiss={toggleDepositModal} isOpen={isOpen}>
      <StyledDepositModal gap={26}>
        <ModalHeader onDismiss={toggleDepositModal}>{t`Fund your account`}</ModalHeader>

        <Column gap={16}>
          <TYPE.medium>
            <Trans>From your bank account</Trans>
          </TYPE.medium>
          {rampSdk && (
            <CustomButton
              title="Ramp"
              subtitle={t`Buy ETH with your credit card or a bank transfer`}
              onClick={rampSdk.show}
            >
              <RampIcon />
            </CustomButton>
          )}

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
            <WrongNetwork>
              <Trans>
                Metamask connected to the wrong network,
                <br />
                please&nbsp;
                <span onClick={activateMetamask}>switch network</span>
              </Trans>
            </WrongNetwork>
          ) : (
            <CustomButton
              title={t`Connect Metamask`}
              subtitle={t`Deposit ETH from your wallet`}
              onClick={activateMetamask}
            >
              <MetamaskIcon />
            </CustomButton>
          )}
        </Column>
      </StyledDepositModal>
    </Modal>
  )
}
