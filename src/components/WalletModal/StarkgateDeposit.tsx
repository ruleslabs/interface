import { useCallback, useState, useMemo } from 'react'
import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'

import { useCurrentUser } from '@/state/user/hooks'
import Column from '@/components/Column'
import CurrencyInput from '@/components/Input/CurrencyInput'
import { metaMaskHooks } from '@/constants/connectors'
import { PrimaryButton } from '@/components/Button'
import { useEthereumETHBalance } from '@/state/wallet/hooks'
import tryParseWeiAmount from '@/utils/tryParseWeiAmount'
import { useEthereumStarkgateContract } from '@/hooks/useContract'
import Wallet from '@/components/Wallet'
import Metamask from '@/components/Metamask'
import EthereumSigner from '@/components/EthereumSigner'
import { useStarknet } from '@/lib/starknet'
import { L2_STARKGATE_ADDRESSES } from '@/constants/addresses'
import { networkId } from '@/constants/networks'
import { L2_STARKGATE_DEPOSIT_HANDLER_SELECTOR_NAME } from '@/constants/misc'

import Arrow from '@/images/arrow.svg'

const { useAccount } = metaMaskHooks

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

  // starknet
  const { provider } = useStarknet()

  // metamask
  const account = useAccount()

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
  const deposit = useCallback(async () => {
    if (!ethereumStarkgateContract || !parsedDepositAmount || !currentUser?.starknetWallet.address || !provider) return

    setWaitingForTx(true)

    const amount = parsedDepositAmount.quotient.toString()

    const messageFee = await provider.estimateMessageFee({
      from_address: ethereumStarkgateContract.address,
      to_address: L2_STARKGATE_ADDRESSES[networkId],
      entry_point_selector: L2_STARKGATE_DEPOSIT_HANDLER_SELECTOR_NAME,
      payload: [currentUser.starknetWallet.address, amount, '0x0'],
    })

    const parsedMessageFee = (messageFee as any).overall_fee?.toString()
    if (!parsedMessageFee) throw 'Failed to estimate message fee'

    // save some wei while we can 🐀
    const payableAmount = parsedDepositAmount.add('1')
    // const payableAmount = parsedDepositAmount.add(parsedMessageFee)

    const estimate = ethereumStarkgateContract.estimateGas.deposit
    const method = ethereumStarkgateContract.deposit
    const args: Array<string | string[] | number> = [amount, currentUser.starknetWallet.address]
    const value = payableAmount.quotient.toString()

    try {
      const estimatedGasLimit = await estimate(...args, value ? { value } : {})
      const response = await method(...args, { ...(value ? { value } : {}), gasLimit: estimatedGasLimit })

      setTxHash(response.hash)
    } catch (error: any) {
      // we only care if the error is something _other_ than the user rejected the tx
      if (error?.code !== 4001) throw error
      setWaitingForTx(false)
    }
  }, [parsedDepositAmount, ethereumStarkgateContract, currentUser?.starknetWallet.address, provider])
  const onDeposit = useCallback(() => {
    deposit().catch((error: any) => {
      console.error(error)
      setError(error.message ?? error)
    })
  }, [deposit])

  // next step check
  const canDeposit = useMemo(
    () => +depositAmount && parsedDepositAmount && balance && !balance.lessThan(parsedDepositAmount),
    [depositAmount, parsedDepositAmount, balance]
  )

  return (
    <EthereumSigner
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
