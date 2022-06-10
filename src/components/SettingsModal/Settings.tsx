import { useCallback } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import { WeiAmount } from '@rulesorg/sdk-core'

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

const Balance = styled(Row)`
  align-items: center;
  gap: 8px 20px;
  width: 100%;
  padding: 18px 12px;
  background: ${({ theme }) => theme.bg5};
  flex-wrap: wrap;

  div {
    font-size: 25px;
  }

  ${({ theme }) => theme.media.medium`
    gap: 8px 12px;
    padding: 12px;

    div {
      font-size: 16px;
      font-weight: 400;
    }
  `}
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
  let balance = useETHBalances([currentUser?.starknetAddress])[currentUser?.starknetAddress]
  balance = currentUser?.starknetAddress ? balance : WeiAmount.fromRawAmount(0)

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

  return (
    <Column gap={20} {...props}>
      <Column gap={12}>
        <TYPE.body>
          <Trans>Current balance</Trans>
        </TYPE.body>
        <Balance>
          {balance ? (
            <>
              <TYPE.body fontWeight={700}>{+balance.toFixed(4)} ETH</TYPE.body>
              <TYPE.body color="text2">{weiAmountToEURValue(balance) ?? '-'} EUR</TYPE.body>
            </>
          ) : (
            <TYPE.subtitle>Loading...</TYPE.subtitle>
          )}
        </Balance>
      </Column>
      <Column gap={26}>
        <TYPE.body onClick={toggleDepositModal} clickable>
          <Trans>Deposit ETH</Trans>
        </TYPE.body>
        <Link href="/settings/profile" onClick={dispatch}>
          <TYPE.body clickable>
            <Trans>Profile settings</Trans>
          </TYPE.body>
        </Link>
        <Link href="/settings/activity" onClick={dispatch}>
          <TYPE.body clickable>
            <Trans>Activity</Trans>
          </TYPE.body>
        </Link>
        <Link href="/settings/sessions" onClick={dispatch}>
          <TYPE.body clickable>
            <Trans>Sessions</Trans>
          </TYPE.body>
        </Link>
        <TYPE.body clickable onClick={logout}>
          <Trans>Logout</Trans>
        </TYPE.body>
      </Column>
    </Column>
  )
}
