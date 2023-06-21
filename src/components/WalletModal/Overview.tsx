import { useCallback, useMemo } from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { constants } from '@rulesorg/sdk-core'

import { ModalBody } from 'src/components/Modal/Sidebar'
import useCurrentUser from 'src/hooks/useCurrentUser'
import { useSetWalletModalMode, useETHBalance, useIsDeployed } from 'src/state/wallet/hooks'
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
import { Row, Column } from 'src/theme/components/Flex'
import * as Icons from 'src/theme/components/Icons'
import DeploymentNeeded from '../LockedWallet/DeploymentNeeded'
import { useStxHistory } from 'src/hooks/useStarknetTx'
import Box from 'src/theme/components/Box'
import Link from '../Link'
import { getChainInfo } from 'src/constants/chainInfo'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'

import { ReactComponent as EthereumIcon } from 'src/images/ethereum-plain.svg'
import useTrans from 'src/hooks/useTrans'

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
  const { lockingReason } = currentUser?.starknetWallet ?? {}

  // i18n
  const trans = useTrans()

  // modal mode
  const setWalletModalMode = useSetWalletModalMode()

  const onDepositMode = useCallback(() => setWalletModalMode(WalletModalMode.DEPOSIT), [setWalletModalMode])
  const onWithdrawMode = useCallback(() => setWalletModalMode(WalletModalMode.STARKGATE_WITHDRAW), [setWalletModalMode])
  const onFundsMigrationMode = useCallback(
    () => setWalletModalMode(WalletModalMode.MIGRATE_FUNDS),
    [setWalletModalMode]
  )

  // ETH balance
  const { address, oldAddress } = useRulesAccount()
  const balance = useETHBalance(address)
  const oldBalance = useETHBalance(oldAddress)

  // is deployed
  const deployed = useIsDeployed(address)

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // loading
  const loading = (oldAddress && !oldBalance) || !balance || deployed === undefined

  // migration
  const canMigrate = useMemo(() => oldBalance?.greaterThan(MIN_OLD_BALANCE_TO_TRIGGER_MIGRATION), [oldBalance])
  const migrationDisabled = !isSoftLockingReason(lockingReason)

  // components
  const componentContent = useMemo(() => {
    if (lockingReason === constants.StarknetWalletLockingReason.MAINTENANCE) return null

    if (loading) return <PaginationSpinner loading />

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

    return <DeploymentNeeded priority={canMigrate ? 'secondary' : 'primary'} />
  }, [loading, deployed, onDepositMode, onWithdrawMode, lockingReason, canMigrate])

  const stxHistory = useStxHistory()

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

        <LockedWallet />

        {canMigrate && oldBalance && (
          <Column gap={'24'} marginBottom={'32'} opacity={migrationDisabled ? 'disabled' : undefined}>
            <Text.HeadlineSmall>
              <Trans>Your wallet has been upgraded, you can retrieve the funds from your old wallet</Trans>
            </Text.HeadlineSmall>

            <PrimaryButton
              onClick={migrationDisabled ? undefined : onFundsMigrationMode}
              disabled={migrationDisabled}
              large
            >
              <Trans>Retrieve - {+oldBalance.toFixed(4)} ETH</Trans>
            </PrimaryButton>
          </Column>
        )}

        {componentContent}

        <Column gap={'24'} marginTop={'32'}>
          <Text.HeadlineMedium>
            <Trans>Recent transactions</Trans>
          </Text.HeadlineMedium>

          <Column gap={'12'}>
            {stxHistory.map((tx) => (
              <Row key={tx.hash} gap={'12'}>
                {tx.loading ? (
                  <Spinner style={{ margin: 'unset', width: '24px' }} />
                ) : tx.success ? (
                  <Box color={'accent'}>
                    <Icons.Checkmark width={'24'} />
                  </Box>
                ) : (
                  <Box color={'error'}>
                    <Icons.Close width={'24'} />
                  </Box>
                )}

                <Text.Body>{trans('stxActionDesc', tx.action)}</Text.Body>

                <Link
                  target="_blank"
                  href={`${getChainInfo(rulesSdk.networkInfos.starknetChainId).explorer}tx/${tx.hash}`}
                  color={'text2'}
                >
                  <Icons.ExternalLink width={'16'} display={'block'} />
                </Link>
              </Row>
            ))}
          </Column>

          {!stxHistory.length && (
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
