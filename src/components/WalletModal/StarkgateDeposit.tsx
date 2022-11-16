import { useCallback, useState, useMemo } from 'react'
import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'

import { useCurrentUser } from '@/state/user/hooks'
import Column from '@/components/Column'
import CurrencyInput from '@/components/Input/CurrencyInput'
import { metaMaskHooks } from '@/constants/connectors'
import { PrimaryButton } from '@/components/Button'
import { useEthereumETHBalance, useSetWalletModalMode } from '@/state/wallet/hooks'
import tryParseWeiAmount from '@/utils/tryParseWeiAmount'
import { useEthereumStarkgateContract } from '@/hooks/useContract'
import Wallet from '@/components/Wallet'
import Metamask from '@/components/Metamask'
import EthereumSigner from '@/components/EthereumSigner'
import { WalletModalMode } from '@/state/wallet/actions'

import Arrow from '@/images/arrow.svg'

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

  // modal mode
  const setWalletModalMode = useSetWalletModalMode()
  const onBack = useCallback(() => setWalletModalMode(WalletModalMode.DEPOSIT), [])

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

  return (
    <EthereumSigner
      onBack={onBack}
      confirmationText={t`Your ${depositAmount} ETH deposit is on its way`}
      transactionText={t`${depositAmount} ETH deposit to your Rules wallet`}
      waitingForTx={waitingForTx}
      txHash={txHash ?? undefined}
      error={error ?? undefined}
    >
      <Metamask>
        <Column gap={32}>
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
        </Column>
      </Metamask>
    </EthereumSigner>
  )
}
