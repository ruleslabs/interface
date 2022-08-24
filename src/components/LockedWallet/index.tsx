import JSBI from 'jsbi'
import { useMemo } from 'react'
import { WeiAmount, MINIMUM_ETH_BALANCE_TO_ESCAPE_SIGNER, ESCAPE_SECURITY_PERIOD } from '@rulesorg/sdk-core'
import { Trans } from '@lingui/macro'

import { useCurrentUser } from '@/state/user/hooks'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import { useETHBalances } from '@/state/wallet/hooks'

export default function LockedWallet() {
  const currentUser = useCurrentUser()

  // ETH balance
  const weiAmountToEURValue = useWeiAmountToEURValue()
  let balance = useETHBalances([currentUser?.starknetWallet.address])[currentUser?.starknetWallet.address]
  balance = currentUser?.starknetWallet.address ? balance : WeiAmount.fromRawAmount(0)

  // signer escape
  const needsDeposit = useMemo(
    () =>
      currentUser?.starknetWallet.needsSignerPublicKeyUpdate &&
      balance &&
      JSBI.lessThan(balance.quotient, MINIMUM_ETH_BALANCE_TO_ESCAPE_SIGNER),
    [currentUser?.starknetWallet.needsSignerPublicKeyUpdate, balance]
  )
  const minimumWeiAmountToEscapeSigner = useMemo(
    () => WeiAmount.fromRawAmount(MINIMUM_ETH_BALANCE_TO_ESCAPE_SIGNER),
    []
  )
  const daysBeforeEscape = useMemo(() => {
    if (!currentUser?.starknetWallet.signerEscapeTriggeredAt) return ESCAPE_SECURITY_PERIOD / 24 / 60 / 60 // nb of days

    const difference = +new Date() - +new Date(currentUser.starknetWallet.signerEscapeTriggeredAt)
    return Math.max(Math.ceil((ESCAPE_SECURITY_PERIOD - difference / 1000) / 24 / 60 / 60), 1)
  }, [currentUser?.starknetWallet.signerEscapeTriggeredAt])

  return (
    <>
      {needsDeposit ? (
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