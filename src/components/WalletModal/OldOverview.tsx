import { Trans } from '@lingui/macro'
import { useCallback, useMemo } from 'react'
import { PrimaryButton } from 'src/components/Button'
import { ModalBody } from 'src/components/Modal/Sidebar'
import { RowCenter } from 'src/components/Row'
import { MIN_OLD_BALANCE_TO_TRIGGER_MIGRATION } from 'src/constants/misc'
import { useMaintenance, useNeedsOldSignerEscape } from 'src/hooks/useCurrentUser'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import useRulesAccount from 'src/hooks/useRulesAccount'
import { ReactComponent as EthereumIcon } from 'src/images/ethereum-plain.svg'
import { WalletModalMode } from 'src/state/wallet/actions'
import { useETHBalance, useSetWalletModalMode } from 'src/state/wallet/hooks'
import { TYPE } from 'src/styles/theme'
import { Column } from 'src/theme/components/Flex'
import * as Text from 'src/theme/components/Text'
import styled from 'styled-components/macro'

import SignerEscape from '../LockedWallet/SignerEscape'
import { PaginationSpinner } from '../Spinner'

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

export default function OldOverview() {
  // current user
  const needsSignerEscape = useNeedsOldSignerEscape()
  const maintenance = useMaintenance()

  // modal mode
  const setWalletModalMode = useSetWalletModalMode()

  const onFundsMigrationMode = useCallback(
    () => setWalletModalMode(WalletModalMode.MIGRATE_FUNDS),
    [setWalletModalMode]
  )

  // ETH balance
  const { oldAddress } = useRulesAccount()
  const balance = useETHBalance(oldAddress)

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // loading
  const loading = !balance

  // migration
  const canMigrate = useMemo(() => balance?.greaterThan(MIN_OLD_BALANCE_TO_TRIGGER_MIGRATION), [balance])

  // components
  const componentContent = useMemo(() => {
    if (maintenance) return null

    if (loading) return <PaginationSpinner loading />

    if (canMigrate && balance) {
      return (
        <Column gap="24" marginBottom="32">
          <Text.HeadlineSmall>
            <Trans>Your wallet has been upgraded, you can retrieve the funds from your old wallet</Trans>
          </Text.HeadlineSmall>

          <PrimaryButton onClick={onFundsMigrationMode} large>
            <Trans>Retrieve - {+balance.toFixed(6)} ETH</Trans>
          </PrimaryButton>
        </Column>
      )
    }

    return null
  }, [loading, canMigrate, balance])

  return (
    <ModalBody>
      <Column gap="32">
        <Column gap="8">
          <ETHBalance>
            <EthereumIcon />
            <TYPE.medium fontSize={36}>{balance ? `${balance.toFixed(6)}` : 'Loading ...'}</TYPE.medium>
          </ETHBalance>

          <FiatBalance>{balance ? `€${weiAmountToEURValue(balance)?.toFixed(2)}` : 'Loading ...'}</FiatBalance>
        </Column>

        {needsSignerEscape && <SignerEscape old />}

        {componentContent}
      </Column>
    </ModalBody>
  )
}
