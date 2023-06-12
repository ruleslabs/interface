import { useCallback, useMemo } from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'

import { ModalBody } from 'src/components/Modal/Sidebar'
import useCurrentUser from 'src/hooks/useCurrentUser'
import { useSetWalletModalMode, useETHBalance } from 'src/state/wallet/hooks'
import { WalletModalMode } from 'src/state/wallet/actions'
import Column from 'src/components/Column'
import { RowCenter } from 'src/components/Row'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import { TYPE } from 'src/styles/theme'
import { PrimaryButton, SecondaryButton } from 'src/components/Button'
import LockedWallet from 'src/components/LockedWallet'
import useRulesAccount from 'src/hooks/useRulesAccount'
import * as Text from 'src/theme/components/Text'

import { ReactComponent as EthereumIcon } from 'src/images/ethereum-plain.svg'
import { PaginationSpinner } from '../Spinner'
import { MIN_OLD_BALANCE_TO_TRIGGER_MIGRATION } from 'src/constants/misc'

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
  const { deployed, lockingReason } = currentUser?.starknetWallet ?? {}

  // modal mode
  const setWalletModalMode = useSetWalletModalMode()

  const onDepositMode = useCallback(() => setWalletModalMode(WalletModalMode.DEPOSIT), [setWalletModalMode])
  const onWithdrawMode = useCallback(() => setWalletModalMode(WalletModalMode.STARKGATE_WITHDRAW), [setWalletModalMode])
  const onDeployMode = useCallback(() => setWalletModalMode(WalletModalMode.DEPLOY), [setWalletModalMode])
  const onFundsMigrationMode = useCallback(
    () => setWalletModalMode(WalletModalMode.MIGRATE_FUNDS),
    [setWalletModalMode]
  )

  // ETH balance
  const { address, oldAddress } = useRulesAccount()
  const balance = useETHBalance(address)
  const oldBalance = useETHBalance(oldAddress)

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // components
  const componentContent = useMemo(() => {
    if ((oldAddress && !oldBalance) || !balance) return <PaginationSpinner loading={true} />

    if (oldBalance?.greaterThan(MIN_OLD_BALANCE_TO_TRIGGER_MIGRATION)) {
      return (
        <Column gap={24}>
          <Text.HeadlineSmall>
            <Trans>Your wallet has been upgraded, you can migrate the funds from your old wallet</Trans>
          </Text.HeadlineSmall>

          <PrimaryButton onClick={onFundsMigrationMode} large disabled={!!lockingReason}>
            <Trans>Migrate - {+oldBalance.toFixed(4)} ETH</Trans>
          </PrimaryButton>
        </Column>
      )
    }

    if (deployed) {
      return (
        <Column gap={8}>
          <PrimaryButton onClick={onDepositMode} large>
            <Trans>Add funds</Trans>
          </PrimaryButton>

          <SecondaryButton onClick={onWithdrawMode} large>
            <Trans>Withdraw</Trans>
          </SecondaryButton>
        </Column>
      )
    }

    return (
      <Column gap={24}>
        <Text.HeadlineSmall>
          <Trans>Your wallet is not deployed, you need to deploy it to interact with other users on Rules.</Trans>
        </Text.HeadlineSmall>

        <PrimaryButton onClick={onDeployMode} large>
          <Trans>Deploy</Trans>
        </PrimaryButton>
      </Column>
    )
  }, [
    oldAddress,
    balance,
    oldBalance,
    deployed,
    onFundsMigrationMode,
    onDeployMode,
    onDepositMode,
    onWithdrawMode,
    lockingReason,
  ])

  return (
    <ModalBody>
      <Column gap={24}>
        <Column gap={8}>
          <ETHBalance>
            <EthereumIcon />
            <TYPE.medium fontSize={36}>{balance ? `${balance.toFixed(6)}` : 'Loading ...'}</TYPE.medium>
          </ETHBalance>

          <FiatBalance>{balance ? `€${weiAmountToEURValue(balance)?.toFixed(2)}` : 'Loading ...'}</FiatBalance>
        </Column>

        {lockingReason && <LockedWallet />}

        {componentContent}
      </Column>
    </ModalBody>
  )
}
