import { useCallback, useMemo } from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { WeiAmount, constants } from '@rulesorg/sdk-core'

import { ModalBody } from 'src/components/Modal/Sidebar'
import useCurrentUser from 'src/hooks/useCurrentUser'
import { useSetWalletModalMode, useETHBalance } from 'src/state/wallet/hooks'
import { WalletModalMode } from 'src/state/wallet/actions'
import { RowCenter } from 'src/components/Row'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import { TYPE } from 'src/styles/theme'
import { PrimaryButton, SecondaryButton } from 'src/components/Button'
import LockedWallet from 'src/components/LockedWallet'
import useRulesAccount from 'src/hooks/useRulesAccount'
import * as Text from 'src/theme/components/Text'
import Spinner, { PaginationSpinner } from '../Spinner'
import { MIN_OLD_BALANCE_TO_TRIGGER_MIGRATION } from 'src/constants/misc'
import { isSoftLockingReason } from 'src/utils/lockingReason'
import { useAllPendingOperations } from 'src/hooks/usePendingOperations'
import useTrans from 'src/hooks/useTrans'
import { Row, Column } from 'src/theme/components/Flex'
import * as Icons from 'src/theme/components/Icons'

import { ReactComponent as EthereumIcon } from 'src/images/ethereum-plain.svg'

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

  // i18n
  const trans = useTrans()

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
    if (lockingReason === constants.StarknetWalletLockingReason.MAINTENANCE) return null

    if ((oldAddress && !oldBalance) || !balance) return <PaginationSpinner loading={true} />

    if (oldBalance?.greaterThan(MIN_OLD_BALANCE_TO_TRIGGER_MIGRATION)) {
      return (
        <Column gap={'24'}>
          <Text.HeadlineSmall>
            <Trans>Your wallet has been upgraded, you can migrate the funds from your old wallet</Trans>
          </Text.HeadlineSmall>

          <PrimaryButton onClick={onFundsMigrationMode} large disabled={!isSoftLockingReason(lockingReason)}>
            <Trans>Migrate - {+oldBalance.toFixed(4)} ETH</Trans>
          </PrimaryButton>
        </Column>
      )
    }

    if (deployed) {
      return (
        <Column gap={'8'}>
          <PrimaryButton onClick={onDepositMode} large>
            <Trans>Add funds</Trans>
          </PrimaryButton>

          <SecondaryButton onClick={onWithdrawMode} large>
            <Trans>Withdraw</Trans>
          </SecondaryButton>
        </Column>
      )
    }

    return <LockedWallet />
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

  const pendingOperations = useAllPendingOperations()
  const formatedPendingOperations = useMemo(
    () =>
      pendingOperations.map((pendingOperation) => ({
        ...pendingOperation,
        parsedQuantity:
          pendingOperation.type === 'transfer' && pendingOperation.tokenId === '0x0'
            ? WeiAmount.fromRawAmount(pendingOperation.quantity)
            : null,
      })),
    [pendingOperations.length]
  )

  return (
    <ModalBody>
      <Column gap={'32'}>
        <Column gap={'8'}>
          <ETHBalance>
            <EthereumIcon />
            <TYPE.medium fontSize={36}>{balance ? `${balance.toFixed(6)}` : 'Loading ...'}</TYPE.medium>
          </ETHBalance>

          <FiatBalance>{balance ? `€${weiAmountToEURValue(balance)?.toFixed(2)}` : 'Loading ...'}</FiatBalance>
        </Column>

        {!isSoftLockingReason(lockingReason) && <LockedWallet />}

        {componentContent}

        <Column gap={'16'} marginTop={'32'}>
          <Text.HeadlineMedium>
            <Trans>Recent transactions</Trans>
          </Text.HeadlineMedium>

          {formatedPendingOperations.map((pendingOperation, index) => (
            <Row key={index} gap={'12'}>
              <Spinner style={{ margin: 'unset', width: '24px' }} />
              <Text.Body>{trans('operation', pendingOperation.type)}</Text.Body>
              {pendingOperation.parsedQuantity && (
                <Text.Small>({+pendingOperation.parsedQuantity.toFixed(6)} ETH)</Text.Small>
              )}
            </Row>
          ))}

          {!pendingOperations.length && (
            <Column color={'bg3'} alignItems={'center'} gap={'8'} marginTop={'16'}>
              <Icons.Ghost width={'64'} />

              <Text.Body color={'text2'}>
                <Trans>No transactions</Trans>
              </Text.Body>
            </Column>
          )}
        </Column>
      </Column>
    </ModalBody>
  )
}
