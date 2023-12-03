import { t, Trans } from '@lingui/macro'
import { constants } from '@rulesorg/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { useCallback, useMemo, useState } from 'react'
import { PrimaryButton } from 'src/components/Button'
import Column from 'src/components/Column'
import EthereumSigner from 'src/components/EthereumSigner'
import CurrencyInput from 'src/components/Input/CurrencyInput'
import Wallet from 'src/components/Wallet'
import { EthereumStatus } from 'src/components/Web3Status'
import { useEthereumStarkgateContract } from 'src/hooks/useContract'
import useCurrentUser from 'src/hooks/useCurrentUser'
import { ReactComponent as Arrow } from 'src/images/arrow.svg'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import { useEthereumETHBalance } from 'src/state/wallet/hooks'
import tryParseWeiAmount from 'src/utils/tryParseWeiAmount'
import styled from 'styled-components/macro'

import { ModalBody } from '../Modal/Sidebar'

const ArrowWrapper = styled(Column)`
  width: 36px;
  height: 36px;
  background: ${({ theme }) => theme.bg4};
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

export default function StarkgateDeposit() {
  // current user
  const { currentUser } = useCurrentUser()

  // metamask
  const { account: l1Account } = useWeb3React()

  // deposit amount
  const [depositAmount, setDepositAmount] = useState('')
  const handleDepositAmountUpdate = useCallback((value: string) => setDepositAmount(value), [])
  const parsedDepositAmount = useMemo(() => tryParseWeiAmount(depositAmount), [depositAmount])

  // balance
  const balance = useEthereumETHBalance(l1Account)

  // tx
  const [txHash, setTxHash] = useState<string | null>(null)
  const [waitingForTx, setWaitingForTx] = useState(false)

  // error
  const [error, setError] = useState<string | null>(null)

  // deposit
  const ethereumStarkgateContract = useEthereumStarkgateContract()
  const deposit = useCallback(async () => {
    const l2StarkgateAddress = (constants.STARKGATE_ADDRESSES as any)[rulesSdk.networkInfos.starknetChainId]
    if (
      !ethereumStarkgateContract ||
      !parsedDepositAmount ||
      !currentUser?.starknetWallet.address ||
      !l2StarkgateAddress
    ) {
      return
    }

    setWaitingForTx(true)

    const amount = parsedDepositAmount.quotient.toString()

    // TODO use message fee when it will be needed

    // const messageFee = await rulesSdk.starknet.estimateMessageFee({
    //   from_address: ethereumStarkgateContract.address,
    //   to_address: l2StarkgateAddress,
    //   entry_point_selector: L2_STARKGATE_DEPOSIT_HANDLER_SELECTOR_NAME,
    //   payload: [currentUser.starknetWallet.address, amount, '0x0'],
    // })

    // const parsedMessageFee = (messageFee as any).overall_fee?.toString()
    // if (!parsedMessageFee) throw 'Failed to estimate message fee'

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
  }, [parsedDepositAmount, ethereumStarkgateContract])

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
    <ModalBody>
      <EthereumSigner
        confirmationText={t`Your ${depositAmount} ETH deposit is on its way`}
        transactionDesc={t`${depositAmount} ETH deposit to your Rules wallet`}
        waitingForTx={waitingForTx}
        txHash={txHash ?? undefined}
        error={error ?? undefined}
      >
        <EthereumStatus>
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

              <Wallet layer="rules" />
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
        </EthereumStatus>
      </EthereumSigner>
    </ModalBody>
  )
}
