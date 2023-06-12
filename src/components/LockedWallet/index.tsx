import JSBI from 'jsbi'
import { useCallback, useMemo } from 'react'
import { WeiAmount, constants } from '@rulesorg/sdk-core'
import { Trans } from '@lingui/macro'

import useCurrentUser from 'src/hooks/useCurrentUser'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import { useETHBalance, useSetWalletModalMode } from 'src/state/wallet/hooks'
import { ErrorCard, InfoCard } from '../Card'
import * as Text from 'src/theme/components/Text'
import { Column } from 'src/theme/components/Flex'
import { PrimaryButton } from '../Button'
import { useOpenModal } from 'src/state/application/hooks'
import { ApplicationModal } from 'src/state/application/actions'
import { WalletModalMode } from 'src/state/wallet/actions'

export default function LockedWallet() {
  const { currentUser } = useCurrentUser()
  const { lockingReason } = currentUser?.starknetWallet ?? {}

  // ETH balance
  const address = currentUser?.starknetWallet.address ?? ''
  const balance = useETHBalance(address) ?? WeiAmount.ZERO

  const weiAmountToEURValue = useWeiAmountToEURValue()

  // signer escape
  const needsDeposit = useMemo(
    () =>
      lockingReason === constants.StarknetWalletLockingReason.SIGNER_ESCAPE &&
      balance &&
      JSBI.lessThan(balance.quotient, constants.MINIMUM_ETH_BALANCE_TO_ESCAPE_SIGNER),
    [lockingReason, balance]
  )
  const minimumWeiAmountToEscapeSigner = useMemo(
    () => WeiAmount.fromRawAmount(constants.MINIMUM_ETH_BALANCE_TO_ESCAPE_SIGNER),
    []
  )
  const daysBeforeEscape = useMemo(() => {
    if (lockingReason !== constants.StarknetWalletLockingReason.SIGNER_ESCAPE) return

    // 7 days if escape is not triggered yet
    if (!currentUser?.starknetWallet.signerEscapeTriggeredAt) return constants.ESCAPE_SECURITY_PERIOD / 24 / 60 / 60 // nb of days

    const difference = +new Date() - +new Date(currentUser.starknetWallet.signerEscapeTriggeredAt)
    return Math.max(Math.ceil((constants.ESCAPE_SECURITY_PERIOD - difference / 1000) / 24 / 60 / 60), 1)
  }, [currentUser?.starknetWallet.signerEscapeTriggeredAt])

  // deploy modal
  const openModal = useOpenModal(ApplicationModal.WALLET)
  const setWalletModalMode = useSetWalletModalMode()

  const openDeployModal = useCallback(() => {
    openModal()
    setWalletModalMode(WalletModalMode.DEPLOY)
  }, [])

  // returns

  switch (lockingReason) {
    case undefined:
      return null

    case constants.StarknetWalletLockingReason.FORCED_UPGRADE:
      return (
        <InfoCard>
          <Trans>
            We are performing a manual upgrade of your wallet. For this purpose, your wallet has to be locked. Your
            access will be recovered in a few days.
          </Trans>
        </InfoCard>
      )

    case constants.StarknetWalletLockingReason.SIGNER_ESCAPE:
      if (needsDeposit) {
        return (
          <ErrorCard>
            <Trans>
              Your wallet is locked. This happens when you reset your password. In order to recover your wallet, you
              need to deposit at least
              <br />
              <strong>
                {minimumWeiAmountToEscapeSigner.toSignificant(18)} ETH (
                {weiAmountToEURValue(minimumWeiAmountToEscapeSigner)}
                €)
              </strong>
            </Trans>
          </ErrorCard>
        )
      } else {
        return (
          <ErrorCard>
            <Trans>
              Your wallet is locked. This happens when you reset your password. For security reasons, your wallet will
              be recovered&nbsp;
              <strong>in {daysBeforeEscape} days.</strong>
            </Trans>
          </ErrorCard>
        )
      }

    case constants.StarknetWalletLockingReason.MAINTENANCE:
      return (
        <InfoCard>
          <Column gap={'24'}>
            <Text.HeadlineSmall>
              <Trans>We are improving Rules !</Trans>
            </Text.HeadlineSmall>

            <Text.Body>
              <Trans>Your wallet is in maintenance, it will be resolved very soon</Trans>
            </Text.Body>
          </Column>
        </InfoCard>
      )

    case constants.StarknetWalletLockingReason.UNDEPLOYED:
      return (
        <Column gap={'24'}>
          <Text.HeadlineSmall>
            <Trans>Your wallet is not deployed, you need to deploy it to interact with other users on Rules.</Trans>
          </Text.HeadlineSmall>

          <PrimaryButton onClick={openDeployModal} large>
            <Trans>Deploy</Trans>
          </PrimaryButton>
        </Column>
      )

    default:
      return (
        <ErrorCard>
          <Trans>Your wallet is locked for an unknown reason, please contact support on discord</Trans>
        </ErrorCard>
      )
  }
}
