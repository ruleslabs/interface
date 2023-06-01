import { useCallback } from 'react'
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
import { ErrorCard } from 'src/components/Card'
import useRulesAccount from 'src/hooks/useRulesAccount'
import * as Text from 'src/theme/components/Text'

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

  // modal mode
  const setWalletModalMode = useSetWalletModalMode()

  const onDepositMode = useCallback(() => setWalletModalMode(WalletModalMode.DEPOSIT), [setWalletModalMode])
  const onWithdrawMode = useCallback(() => setWalletModalMode(WalletModalMode.STARKGATE_WITHDRAW), [setWalletModalMode])
  const onDeployMode = useCallback(() => setWalletModalMode(WalletModalMode.DEPLOY), [setWalletModalMode])

  // ETH balance
  const { address } = useRulesAccount()
  const balance = useETHBalance(address)

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

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

        {lockingReason && (
          <ErrorCard>
            <LockedWallet />
          </ErrorCard>
        )}

        {deployed ? (
          <Column gap={8}>
            <PrimaryButton onClick={onDepositMode} large>
              <Trans>Add funds</Trans>
            </PrimaryButton>

            <SecondaryButton onClick={onWithdrawMode} large>
              <Trans>Withdraw</Trans>
            </SecondaryButton>
          </Column>
        ) : (
          <Column gap={24}>
            <Text.HeadlineSmall>
              <Trans>Your wallet is not deployed, you need to deploy it to interact with other users on Rules.</Trans>
            </Text.HeadlineSmall>

            <PrimaryButton onClick={onDeployMode} large>
              <Trans>Deploy</Trans>
            </PrimaryButton>
          </Column>
        )}
      </Column>
    </ModalBody>
  )
}
