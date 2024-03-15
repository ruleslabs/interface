import { Trans } from '@lingui/macro'
import { constants } from '@rulesorg/sdk-core'
import { useAccount } from '@starknet-react/core'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { PrimaryButton } from 'src/components/Button'
import Column from 'src/components/Column'
import CurrencyInput from 'src/components/Input/CurrencyInput'
import StarknetSigner from 'src/components/StarknetSigner/Transaction'
import Wallet from 'src/components/Wallet'
import { StarknetStatus } from 'src/components/Web3Status'
import useCurrentUser from 'src/hooks/useCurrentUser'
import useStarknetTx from 'src/hooks/useStarknetTx'
import { ReactComponent as Arrow } from 'src/images/arrow.svg'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import { ApplicationModal } from 'src/state/application/actions'
import { useModalOpened } from 'src/state/application/hooks'
import { useETHBalance, useSTRKBalance } from 'src/state/wallet/hooks'
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

function isEthCurrency(currency: 'ETH'|'STRK') {
	return currency === 'ETH';
}

export default function StarknetWithdraw() {
  const [withdrawCurrency, setWithdrawCurrency] = useState<'ETH'|'STRK'>('ETH')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  // current user
  const { currentUser } = useCurrentUser()

  // modal
  const isOpen = useModalOpened(ApplicationModal.WALLET)

  // external starknet
  const { address: l2Address } = useAccount()

  // balance
  const address = currentUser?.starknetWallet.address ?? ''
  const balance = isEthCurrency(withdrawCurrency) ? useETHBalance(address) : useSTRKBalance(address);

  // withdraw
  const handleWithdrawAmountUpdate = useCallback((value: string) => setWithdrawAmount(value), [setWithdrawAmount])
  const parsedWithdrawAmount = useMemo(() => tryParseWeiAmount(withdrawAmount), [withdrawAmount])

  // starknet tx
  const { setCalls, resetStarknetTx, increaseTxValue, setSigning } = useStarknetTx()

  // call
  const handleConfirmation = useCallback(() => {
    const tokenAddress = isEthCurrency(withdrawCurrency) ? constants.ETH_ADDRESSES[rulesSdk.networkInfos.starknetChainId] : constants.STRK_ADDRESSES[rulesSdk.networkInfos.starknetChainId]
    if (!parsedWithdrawAmount || !l2Address || !tokenAddress) return

    const amount = parsedWithdrawAmount.quotient.toString()

    setCalls([
      {
        contractAddress: tokenAddress,
        entrypoint: 'transfer',
        calldata: [l2Address, amount, 0],
      },
    ])
    increaseTxValue(isEthCurrency(withdrawCurrency) ? 'ETH' : 'STRK', parsedWithdrawAmount)
    setSigning(true)
  }, [parsedWithdrawAmount, l2Address, setSigning, increaseTxValue, setCalls])

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
      <StarknetSigner action={isEthCurrency(withdrawCurrency) ? 'ethTransfer' : 'strkTransfer'}>
        <StarknetStatus>
          <Column gap={32}>
            <Column>
              <CurrencyInput
                value={withdrawAmount}
                placeholder="0.0"
                onUserInput={handleWithdrawAmountUpdate}
                balance={balance}
								currency={withdrawCurrency}
								onCurrencyChange={() => {setWithdrawCurrency(isEthCurrency(withdrawCurrency) ? 'STRK' : 'ETH')}}
              />

              <ArrowWrapper>
                <Arrow />
              </ArrowWrapper>

              <Wallet layer={2} />
            </Column>

            <PrimaryButton onClick={handleConfirmation} disabled={!canWithdraw} large>
              {!+withdrawAmount || !parsedWithdrawAmount ? (
                <Trans>Enter an amount</Trans>
              ) : balance?.lessThan(parsedWithdrawAmount) ? (
                <Trans>Insufficient {withdrawCurrency} balance</Trans>
              ) : (
                <Trans>Next</Trans>
              )}
            </PrimaryButton>
          </Column>
        </StarknetStatus>
      </StarknetSigner>
    </ModalBody>
  )
}
