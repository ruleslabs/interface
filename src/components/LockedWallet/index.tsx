import JSBI from 'jsbi'
import { useMemo } from 'react'
import { WeiAmount, constants } from '@rulesorg/sdk-core'
import { Trans } from '@lingui/macro'

import useCurrentUser from 'src/hooks/useCurrentUser'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import { useETHBalance } from 'src/state/wallet/hooks'

export default function LockedWallet() {
  const { currentUser } = useCurrentUser()
  const { lockingReason } = currentUser?.starknetWallet ?? {}

  // ETH balance
  const address = currentUser?.starknetWallet.address ?? ''
  const balance = useETHBalance(address) ?? WeiAmount.ZERO

  const weiAmountToEURValue = useWeiAmountToEURValue()

  // forced upgrade
  const isLockedForForcedUpgrade = useMemo(
    () => lockingReason === constants.StarknetWalletLockingReason.FORCED_UPGRADE,
    [lockingReason]
  )

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

  // returns

  if (isLockedForForcedUpgrade) {
    return (
      <Trans>
        We are performing a manual upgrade of your wallet. For this purpose, your wallet has to be locked. Your access
        will be recovered in a few days.
      </Trans>
    )
  }

  if (needsDeposit) {
    return (
      <Trans>
        Your wallet is locked. This happens when you reset your password. In order to recover your wallet, you need to
        deposit at least
        <br />
        <strong>
          {minimumWeiAmountToEscapeSigner.toSignificant(18)} ETH ({weiAmountToEURValue(minimumWeiAmountToEscapeSigner)}
          €)
        </strong>
      </Trans>
    )
  }

  return (
    <Trans>
      Your wallet is locked. This happens when you reset your password. For security reasons, your wallet will be
      recovered&nbsp;
      <strong>in {daysBeforeEscape} days.</strong>
    </Trans>
  )
}
