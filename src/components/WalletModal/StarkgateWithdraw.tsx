import { useCallback, useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { t, Trans } from '@lingui/macro'

import Column from '@/components/Column'
import { PrimaryButton } from '@/components/Button'
import tryParseWeiAmount from '@/utils/tryParseWeiAmount'
import CurrencyInput from '@/components/Input/CurrencyInput'
import { metaMaskHooks } from '@/constants/connectors'
import useCurrentUser from '@/hooks/useCurrentUser'
import StarknetSigner, { StarknetSignerDisplayProps } from '@/components/StarknetSigner'
import { useETHBalances } from '@/state/wallet/hooks'
import Wallet from '@/components/Wallet'
import Metamask from '@/components/Metamask'
import * as Text from 'src/theme/components/Text'

import Arrow from '@/images/arrow.svg'
import { constants } from '@rulesorg/sdk-core'
import { rulesSdk } from '@/lib/rulesWallet/rulesSdk'
import { useModalOpened } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import useStarknetTx from '@/hooks/useStarknetTx'
import { ModalBody } from '../Modal/Sidebar'

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

const display: StarknetSignerDisplayProps = {
  confirmationText: t`Your withdraw is on its way`,
  confirmationActionText: t`Confirm withdraw`,
  transactionText: t`ETH withdraw to your Ethereum wallet`,
}

export default function WithdrawModal() {
  // current user
  const { currentUser } = useCurrentUser()

  // modal
  const isOpen = useModalOpened(ApplicationModal.WALLET)

  // metamask
  const account = useAccount()

  // balance
  const address = currentUser?.starknetWallet.address ?? ''
  const balances = useETHBalances([address])
  const balance = balances?.[address]

  // withdraw
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const handleWithdrawAmountUpdate = useCallback((value: string) => setWithdrawAmount(value), [setWithdrawAmount])
  const parsedWithdrawAmount = useMemo(() => tryParseWeiAmount(withdrawAmount), [withdrawAmount])

  // starknet tx
  const { setCalls, resetStarknetTx, increaseTxValue, setSigning } = useStarknetTx()

  // call
  const handleConfirmation = useCallback(() => {
    const ethAddress = constants.ETH_ADDRESSES[rulesSdk.networkInfos.starknetChainId]
    const l2StarkgateAddress = constants.STARKGATE_ADDRESSES[rulesSdk.networkInfos.starknetChainId]
    if (!parsedWithdrawAmount || !account || !ethAddress || !l2StarkgateAddress) return

    const amount = parsedWithdrawAmount.quotient.toString()

    setCalls([
      {
        contractAddress: ethAddress,
        entrypoint: 'increaseAllowance',
        calldata: [l2StarkgateAddress, amount, 0],
      },
      {
        contractAddress: l2StarkgateAddress,
        entrypoint: 'initiate_withdraw',
        calldata: [account, amount, 0],
      },
    ])
    increaseTxValue(parsedWithdrawAmount)
    setSigning(true)
  }, [parsedWithdrawAmount, account, setSigning, increaseTxValue, setCalls])

  // next step check
  const canWithdraw = useMemo(
    () => +withdrawAmount && parsedWithdrawAmount && balance && !balance.lessThan(parsedWithdrawAmount),
    [withdrawAmount, parsedWithdrawAmount, balance]
  )

  useEffect(() => {
    resetStarknetTx()
  }, [isOpen])

  return (
    <ModalBody>
      <StarknetSigner display={display}>
        <Metamask>
          <Column gap={32}>
            <Text.Body>
              <Trans>
                There will be an additional step in a few hours to finalize the withdraw. Please note that this step
                will require a small amount of ETH on your metamask
              </Trans>
            </Text.Body>

            <Column>
              <CurrencyInput
                value={withdrawAmount}
                placeholder="0.0"
                onUserInput={handleWithdrawAmountUpdate}
                balance={balance}
              />

              <ArrowWrapper>
                <Arrow />
              </ArrowWrapper>

              <Wallet layer={1} />
            </Column>

            <PrimaryButton onClick={handleConfirmation} disabled={!canWithdraw} large>
              {!+withdrawAmount || !parsedWithdrawAmount ? (
                <Trans>Enter an amount</Trans>
              ) : balance?.lessThan(parsedWithdrawAmount) ? (
                <Trans>Insufficient ETH balance</Trans>
              ) : (
                <Trans>Next</Trans>
              )}
            </PrimaryButton>
          </Column>
        </Metamask>
      </StarknetSigner>
    </ModalBody>
  )
}
