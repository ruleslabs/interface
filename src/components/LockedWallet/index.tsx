import JSBI from 'jsbi'
import { useMemo } from 'react'
import {
  WeiAmount,
  StarknetWalletLockingReason,
  MINIMUM_ETH_BALANCE_TO_ESCAPE_SIGNER,
  ESCAPE_SECURITY_PERIOD,
} from '@rulesorg/sdk-core'
import { Trans } from '@lingui/macro'

import useCurrentUser from '@/hooks/useCurrentUser'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import { useETHBalances } from '@/state/wallet/hooks'

export default function LockedWallet() {
  const { currentUser } = useCurrentUser()

  // ETH balance
  const address = currentUser?.starknetWallet.address ?? ''
  const balances = useETHBalances([address])
  const balance = balances?.[address] ?? WeiAmount.fromRawAmount(0)

  const weiAmountToEURValue = useWeiAmountToEURValue()

  // forced upgrade
  const isLockedForForcedUpgrade = useMemo(
    () => currentUser?.starknetWallet.lockingReason === StarknetWalletLockingReason.FORCED_UPGRADE,
    [currentUser?.starknetWallet.lockingReason]
  )

  // signer escape
  const needsDeposit = useMemo(
    () =>
      currentUser?.starknetWallet.lockingReason === StarknetWalletLockingReason.SIGNER_ESCAPE &&
      balance &&
      JSBI.lessThan(balance.quotient, MINIMUM_ETH_BALANCE_TO_ESCAPE_SIGNER),
    [currentUser?.starknetWallet.lockingReason, balance]
  )
  const minimumWeiAmountToEscapeSigner = useMemo(
    () => WeiAmount.fromRawAmount(MINIMUM_ETH_BALANCE_TO_ESCAPE_SIGNER),
    []
  )
  const daysBeforeEscape = useMemo(() => {
    if (currentUser?.starknetWallet.lockingReason !== StarknetWalletLockingReason.SIGNER_ESCAPE) return

    // 7 days if escape is not triggered yet
    if (!currentUser?.starknetWallet.signerEscapeTriggeredAt) return ESCAPE_SECURITY_PERIOD / 24 / 60 / 60 // nb of days

    const difference = +new Date() - +new Date(currentUser.starknetWallet.signerEscapeTriggeredAt)
    return Math.max(Math.ceil((ESCAPE_SECURITY_PERIOD - difference / 1000) / 24 / 60 / 60), 1)
  }, [currentUser?.starknetWallet.signerEscapeTriggeredAt])

  return (
    <>
      {isLockedForForcedUpgrade ? (
        <Trans>
          We are performing a manual upgrade of your wallet. For this purpose, your wallet has to be locked. Your access
          will be recovered in a few days.
        </Trans>
      ) : needsDeposit ? (
        <Trans>
          Your wallet is locked. This happens when you reset your password. In order to recover your wallet, you need to
          deposit at least
          <br />
          <strong>
            {minimumWeiAmountToEscapeSigner.toSignificant(18)} ETH (
            {weiAmountToEURValue(minimumWeiAmountToEscapeSigner)}€)
          </strong>
        </Trans>
      ) : (
        <Trans>
          Your wallet is locked. This happens when you reset your password. For security reasons, your wallet will be
          recovered&nbsp;
          <strong>in {daysBeforeEscape} days.</strong>
        </Trans>
      )}
    </>
  )
}
