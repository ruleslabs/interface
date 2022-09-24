import { useCallback, useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'

import { useCurrentUser } from '@/state/user/hooks'
import Modal from '@/components/Modal'
import Column from '@/components/Column'
import { useModalOpen, useDepositModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
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
import EthereumSigner from '@/components/EthereumSigner'

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

export default function DepositModal() {
  // current user
  const currentUser = useCurrentUser()

  // Ramp
  const rampSdk = useRampSdk({ email: currentUser?.email, address: currentUser?.starknetWallet.address })

  // modal
  const isOpen = useModalOpen(ApplicationModal.DEPOSIT)
  const toggleDepositModal = useDepositModalToggle()

  // metamask
  const account = useAccount()
  const chainId = useChainId()

  // deposit amount
  const [depositAmount, setDepositAmount] = useState('')
  const handleDepositAmountUpdate = useCallback((value: string) => setDepositAmount(value), [setDepositAmount])
  const parsedDepositAmount = useMemo(() => tryParseWeiAmount(depositAmount), [depositAmount])

  // balance
  const balance = useEthereumETHBalance(account)

  // tx
  const [txHash, setTxHash] = useState<string | null>(null)
  const [waitingForTx, setWaitingForTx] = useState(false)

  // error
  const [error, setError] = useState<string | null>(null)

  // deposit
  const ethereumStarkgateContract = useEthereumStarkgateContract()
  const onDeposit = useCallback(() => {
    if (!ethereumStarkgateContract || !parsedDepositAmount || !currentUser?.starknetWallet.address) return

    setWaitingForTx(true)

    const estimate = ethereumStarkgateContract.estimateGas.deposit
    const method = ethereumStarkgateContract.deposit
    const args: Array<string | string[] | number> = [currentUser.starknetWallet.address]
    const value = parsedDepositAmount.quotient.toString()

    estimate(...args, value ? { value } : {})
      .then((estimatedGasLimit) =>
        method(...args, { ...(value ? { value } : {}), gasLimit: estimatedGasLimit }).then((response: any) => {
          setTxHash(response.hash)
        })
      )
      .catch((error: any) => {
        setError(error.message)
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) console.error(error)
      })
  }, [parsedDepositAmount, ethereumStarkgateContract, currentUser?.starknetWallet.address])

  // next step check
  const canDeposit = useMemo(
    () => +depositAmount && parsedDepositAmount && balance && !balance.lessThan(parsedDepositAmount),
    [depositAmount, parsedDepositAmount, balance]
  )

  // on close modal
  useEffect(() => {
    if (isOpen) {
      setWaitingForTx(false)
      setDepositAmount('')
      setError(null)
      setTxHash(null)
    }
  }, [isOpen])

  return (
    <Modal onDismiss={toggleDepositModal} isOpen={isOpen}>
      <EthereumSigner
        modalHeaderChildren={t`Fund your account`}
        confirmationText={t`Your ${depositAmount} ETH deposit is on its way`}
        confirmationActionText={t`Confirm deposit`}
        transactionText={t`${depositAmount} ETH deposit to your Rules wallet`}
        waitingForTx={waitingForTx}
        txHash={txHash ?? undefined}
        error={error ?? undefined}
        onDismiss={toggleDepositModal}
      >
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

              <PrimaryButton onClick={onDeposit} disabled={!canDeposit} large>
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
      </EthereumSigner>
    </Modal>
  )
}
