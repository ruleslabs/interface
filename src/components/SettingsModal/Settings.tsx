import JSBI from 'jsbi'
import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import { WeiAmount, MINIMUM_ETH_BALANCE_TO_ESCAPE_SIGNER, ESCAPE_SECURITY_PERIOD } from '@rulesorg/sdk-core'

import { useCurrentUser } from '@/state/user/hooks'
import { useETHBalances } from '@/state/wallet/hooks'
import Column from '@/components/Column'
import Row from '@/components/Row'
import { TYPE } from '@/styles/theme'
import Link from '@/components/Link'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import { storeAccessToken } from '@/utils/accessToken'
import { useRemoveCurrentUser } from '@/state/user/hooks'
import { useRevokeSessionMutation } from '@/state/auth/hooks'
import { useDepositModalToggle } from '@/state/application/hooks'
import ErrorCard from '@/components/ErrorCard'

const Balance = styled(Row)<{ alert?: boolean }>`
  align-items: center;
  gap: 8px 20px;
  width: 100%;
  padding: 18px 12px;
  background: ${({ theme }) => theme.bg5};
  flex-wrap: wrap;
  border-radius: 3px;

  ${({ theme }) => theme.media.medium`
    gap: 8px 12px;
    padding: 12px;

    div {
      font-size: 16px;
      font-weight: 400;
    }
  `}

  ${({ theme, alert = false }) => alert && theme.before.alert}
`

interface SettingsProps extends React.HTMLAttributes<HTMLDivElement> {
  dispatch: () => void
}

export default function Settings({ dispatch, ...props }: SettingsProps) {
  const currentUser = useCurrentUser()
  const router = useRouter()

  // Deposit ETH
  const toggleDepositModal = useDepositModalToggle()

  // ETH balance
  const weiAmountToEURValue = useWeiAmountToEURValue()
  let balance = useETHBalances([currentUser?.starknetWallet.address])[currentUser?.starknetWallet.address]
  balance = currentUser?.starknetWallet.address ? balance : WeiAmount.fromRawAmount(0)

  // Logout
  const [revokeSessionMutation] = useRevokeSessionMutation()
  const removeCurrentUser = useRemoveCurrentUser()
  const logout = useCallback(() => {
    revokeSessionMutation({ variables: { payload: null } })
      .catch((error) => console.error(error))
      .finally(() => {
        storeAccessToken('')
        dispatch()
        removeCurrentUser()
        router.replace('/')
      })
  }, [storeAccessToken, dispatch, removeCurrentUser, revokeSessionMutation, router])

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
    <Column gap={20} {...props}>
      <Column gap={12}>
        <TYPE.body>
          <Trans>Current balance</Trans>
        </TYPE.body>
        <Balance alert={currentUser?.starknetWallet.needsSignerPublicKeyUpdate}>
          {!currentUser?.starknetWallet.address ? (
            <TYPE.subtitle>
              <Trans>Creating wallet...</Trans>
            </TYPE.subtitle>
          ) : balance ? (
            <>
              <TYPE.body fontSize={24} fontWeight={700}>
                {+balance.toFixed(4, 0)} ETH
              </TYPE.body>
              <TYPE.body fontSize={24} color="text2">
                {weiAmountToEURValue(balance) ?? '-'} EUR
              </TYPE.body>
            </>
          ) : (
            <TYPE.subtitle>Loading...</TYPE.subtitle>
          )}
        </Balance>
        {currentUser?.starknetWallet.needsSignerPublicKeyUpdate && (
          <ErrorCard>
            {needsDeposit ? (
              <Trans>
                Your wallet is locked. This happens when you reset your password. In order to recover your wallet, you
                need to deposit at least
                <br />
                <strong>
                  {minimumWeiAmountToEscapeSigner.toSignificant(18)} ETH (
                  {weiAmountToEURValue(minimumWeiAmountToEscapeSigner)}€)
                </strong>
              </Trans>
            ) : (
              <Trans>
                Your wallet is locked. This happens when you reset your password. For security reasons, your wallet will
                be recovered
                <br />
                <strong>in {daysBeforeEscape} days.</strong>
              </Trans>
            )}
          </ErrorCard>
        )}
      </Column>
      <Column gap={26}>
        {currentUser?.starknetWallet.address && (
          <TYPE.body onClick={toggleDepositModal} clickable>
            <Trans>Deposit ETH</Trans>
          </TYPE.body>
        )}
        <Link href="/settings/profile">
          <TYPE.body clickable>
            <Trans>Profile settings</Trans>
          </TYPE.body>
        </Link>
        <Link href="/settings/security">
          <TYPE.body clickable>
            <Trans>Security</Trans>
          </TYPE.body>
        </Link>
        <TYPE.body clickable onClick={logout}>
          <Trans>Logout</Trans>
        </TYPE.body>
      </Column>
    </Column>
  )
}
