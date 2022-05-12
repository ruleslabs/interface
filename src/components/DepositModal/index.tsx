import React, { useState, useEffect, useCallback, useMemo } from 'react'
import styled from 'styled-components'

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
  align-items: center;
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

  return (
    <Modal onDismiss={toggleDepositModal} isOpen={isOpen}>
      <StyledDepositModal gap={26}>
        <ModalHeader toggleModal={toggleDepositModal}>Fund your account</ModalHeader>

        <Column gap={16}>
          <TYPE.medium>from your bank account</TYPE.medium>
          {rampSdk && (
            <CustomButton
              title="Ramp"
              subtitle="Buy ETH with your credit card or a bank transfer"
              onClick={rampSdk.show}
            >
              <RampIcon />
            </CustomButton>
          )}

          <Separator>or</Separator>

          <TYPE.medium>from your Ethereum wallet</TYPE.medium>

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
                  Enter an amount
                </PrimaryButton>
              ) : balance?.lessThan(parsedDepositAmount) ? (
                <PrimaryButton disabled large>
                  Insufficient ETH balance
                </PrimaryButton>
              ) : (
                <PrimaryButton large>Deposit</PrimaryButton>
              )}
            </Column>
          ) : account ? (
            <WrongNetwork>
              Metamask connected to the wrong network,
              <br />
              please&nbsp;
              <span onClick={activateMetamask}>switch network</span>
            </WrongNetwork>
          ) : (
            <CustomButton title="Connect Metamask" subtitle="Deposit ETH from your wallet" onClick={activateMetamask}>
              <MetamaskIcon />
            </CustomButton>
          )}
        </Column>
      </StyledDepositModal>
    </Modal>
  )
}
