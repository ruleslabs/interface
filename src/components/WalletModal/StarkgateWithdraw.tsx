import { useCallback, useState, useMemo, useEffect } from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'

import Column from 'src/components/Column'
import { PrimaryButton } from 'src/components/Button'
import tryParseWeiAmount from 'src/utils/tryParseWeiAmount'
import CurrencyInput from 'src/components/Input/CurrencyInput'
import useCurrentUser from 'src/hooks/useCurrentUser'
import StarknetSigner from 'src/components/StarknetSigner/Transaction'
import { useETHBalance } from 'src/state/wallet/hooks'
import Wallet from 'src/components/Wallet'
import { EthereumStatus } from 'src/components/Web3Status'
import * as Text from 'src/theme/components/Text'

import { ReactComponent as Arrow } from 'src/images/arrow.svg'
import { constants } from '@rulesorg/sdk-core'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import { useModalOpened } from 'src/state/application/hooks'
import { ApplicationModal } from 'src/state/application/actions'
import useStarknetTx from 'src/hooks/useStarknetTx'
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

export default function StarkgateWithdraw() {
  const [withdrawAmount, setWithdrawAmount] = useState('')

  // current user
  const { currentUser } = useCurrentUser()

  // modal
  const isOpen = useModalOpened(ApplicationModal.WALLET)

  // metamask
  const { account: l1Account } = useWeb3React()

  // balance
  const address = currentUser?.starknetWallet.address ?? ''
  const balance = useETHBalance(address)

  // withdraw
  const handleWithdrawAmountUpdate = useCallback((value: string) => setWithdrawAmount(value), [setWithdrawAmount])
  const parsedWithdrawAmount = useMemo(() => tryParseWeiAmount(withdrawAmount), [withdrawAmount])

  // starknet tx
  const { setCalls, resetStarknetTx, increaseTxValue, setSigning } = useStarknetTx()

  // call
  const handleConfirmation = useCallback(() => {
    const ethAddress = constants.ETH_ADDRESSES[rulesSdk.networkInfos.starknetChainId]
    const l2StarkgateAddress = (constants.STARKGATE_ADDRESSES as any)[rulesSdk.networkInfos.starknetChainId]
    if (!parsedWithdrawAmount || !l1Account || !ethAddress || !l2StarkgateAddress) return

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
        calldata: [l1Account, amount, 0],
      },
    ])
    increaseTxValue(parsedWithdrawAmount)
    setSigning(true)
  }, [parsedWithdrawAmount, l1Account, setSigning, increaseTxValue, setCalls])

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
      <StarknetSigner action={'ethTransfer'}>
        <EthereumStatus>
          <Column gap={32}>
            <Text.Body>
              <Trans>
                There will be an additional step in a few hours to finalize the withdraw. Please note that this step
                will require a small amount of ETH on your Metamask.
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
        </EthereumStatus>
      </StarknetSigner>
    </ModalBody>
  )
}
