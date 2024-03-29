import { Trans } from '@lingui/macro'
import { useCallback, useMemo } from 'react'
import { PrimaryButton, SecondaryButton } from 'src/components/Button'
import { ModalBody } from 'src/components/Modal/Sidebar'
import { RowCenter } from 'src/components/Row'
import { getChainInfo } from 'src/constants/chainInfo'
import { useMaintenance, useNeedsSignerEscape } from 'src/hooks/useCurrentUser'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import useRulesAccount from 'src/hooks/useRulesAccount'
import { useStxHistory } from 'src/hooks/useStarknetTx'
import useTrans from 'src/hooks/useTrans'
import { ReactComponent as EthereumIcon } from 'src/images/ethereum-plain.svg'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import { WalletModalMode } from 'src/state/wallet/actions'
import { useETHBalance, useIsDeployed, useSetWalletModalMode } from 'src/state/wallet/hooks'
import { TYPE } from 'src/styles/theme'
import Box from 'src/theme/components/Box'
import { Column, Row } from 'src/theme/components/Flex'
import * as Icons from 'src/theme/components/Icons'
import * as Text from 'src/theme/components/Text'
import styled from 'styled-components/macro'

import Link from '../Link'
import DeploymentNeeded from '../LockedWallet/DeploymentNeeded'
import SignerEscape from '../LockedWallet/SignerEscape'
import Spinner, { PaginationSpinner } from '../Spinner'

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
  const needsSignerEscape = useNeedsSignerEscape()
  const maintenance = useMaintenance()

  // i18n
  const trans = useTrans()

  // modal mode
  const setWalletModalMode = useSetWalletModalMode()

  const onDepositMode = useCallback(() => setWalletModalMode(WalletModalMode.DEPOSIT), [setWalletModalMode])
  const onWithdrawMode = useCallback(() => setWalletModalMode(WalletModalMode.WITHDRAW), [setWalletModalMode])
  const onOldOverviewMode = useCallback(() => setWalletModalMode(WalletModalMode.OLD_OVERVIEW), [setWalletModalMode])

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

  // components
  const componentContent = useMemo(() => {
    if (maintenance) return null

    if (loading) return <PaginationSpinner loading />

    if (deployed) {
      return (
        <Column gap="8">
          <PrimaryButton onClick={onDepositMode} large>
            <Trans>Add funds</Trans>
          </PrimaryButton>

          <SecondaryButton onClick={onWithdrawMode} large>
            <Trans>Withdraw</Trans>
          </SecondaryButton>
        </Column>
      )
    }

    return <DeploymentNeeded />
  }, [loading, deployed, onDepositMode, onWithdrawMode])

  const stxHistory = useStxHistory()

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

        {needsSignerEscape && <SignerEscape />}

        {componentContent}

        {oldAddress && (
          <Text.Link onClick={onOldOverviewMode} textDecoration="underline">
            <Trans>See my old wallet</Trans>
          </Text.Link>
        )}

        <Column gap="24" marginTop="32">
          <Text.HeadlineMedium>
            <Trans>Recent transactions</Trans>
          </Text.HeadlineMedium>

          <Column gap="12">
            {stxHistory.map((tx) => (
              <Row key={tx.hash} gap="12">
                {tx.loading ? (
                  <Spinner style={{ margin: 'unset', width: '24px' }} />
                ) : tx.success ? (
                  <Box color="accent">
                    <Icons.Checkmark width="24" />
                  </Box>
                ) : (
                  <Box color="error">
                    <Icons.Close width="24" />
                  </Box>
                )}

                <Text.Body>{trans('stxActionDesc', tx.action)}</Text.Body>

                <Link
                  target="_blank"
                  href={`${getChainInfo(rulesSdk.networkInfos.starknetChainId)?.explorer}tx/${tx.hash}`}
                  color="text2"
                >
                  <Icons.ExternalLink width="16" display="block" />
                </Link>
              </Row>
            ))}
          </Column>

          {!stxHistory.length && (
            <Column color="bg3" alignItems="center" gap="8" marginTop="16">
              <Icons.Ghost width="64" />

              <Text.Body color="text2">
                <Trans>No transactions</Trans>
              </Text.Body>
            </Column>
          )}
        </Column>
      </Column>
    </ModalBody>
  )
}
