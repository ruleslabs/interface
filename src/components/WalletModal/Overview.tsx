import { useCallback } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { ModalBody } from '@/components/Modal/Sidebar'
import useCurrentUser from '@/hooks/useCurrentUser'
import { useSetWalletModalMode, useETHBalance } from '@/state/wallet/hooks'
import { WalletModalMode } from '@/state/wallet/actions'
import Column from '@/components/Column'
import { RowCenter } from '@/components/Row'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import { TYPE } from '@/styles/theme'
import { PrimaryButton, SecondaryButton } from '@/components/Button'
import LockedWallet from '@/components/LockedWallet'
import { ErrorCard } from '@/components/Card'
import useRulesAccount from '@/hooks/useRulesAccount'

import EthereumIcon from '@/images/ethereum-plain.svg'

const ETHBalance = styled(RowCenter)`
  width: 100%;
  margin-top: 16px;
  gap: 8px;

  & svg {
    fill: ${({ theme }) => theme.text1};
    height: 36px;
  }
`

const FiatBalance = styled(TYPE.subtitle)`
  width: 100%;
  font-size: 18px;
`

export default function Overview() {
  // current user
  const { currentUser } = useCurrentUser()

  // modal mode
  const setWalletModalMode = useSetWalletModalMode()

  const onDepositMode = useCallback(() => setWalletModalMode(WalletModalMode.DEPOSIT), [setWalletModalMode])
  const onWithdrawMode = useCallback(() => setWalletModalMode(WalletModalMode.WITHDRAW), [setWalletModalMode])

  // ETH balance
  const { address } = useRulesAccount()
  const balance = useETHBalance(address)

  const weiAmountToEURValue = useWeiAmountToEURValue()

  return (
    <ModalBody>
      <Column gap={24}>
        <Column gap={8}>
          <ETHBalance>
            <EthereumIcon />
            <TYPE.medium fontSize={36}>{balance ? `${balance.toFixed(6)}` : 'Loading ...'}</TYPE.medium>
          </ETHBalance>

          <FiatBalance>{balance ? `€${weiAmountToEURValue(balance)?.toFixed(2)}` : '- €'}</FiatBalance>
        </Column>

        {currentUser?.starknetWallet.lockingReason && (
          <ErrorCard>
            <LockedWallet />
          </ErrorCard>
        )}

        <Column gap={8}>
          <PrimaryButton onClick={onDepositMode}>
            <Trans>Add funds</Trans>
          </PrimaryButton>

          <SecondaryButton onClick={onWithdrawMode}>
            <Trans>Withdraw</Trans>
          </SecondaryButton>
        </Column>
      </Column>
    </ModalBody>
  )
}
