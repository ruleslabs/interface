import { useCallback } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'

import { useCurrentUser } from '@/state/user/hooks'
import { useETHBalances } from '@/state/wallet/hooks'
import Column from '@/components/Column'
import Row from '@/components/Row'
import { TYPE } from '@/styles/theme'
import Link from '@/components/Link'
import useRampSdk from '@/hooks/useRampSdk'
import { useEtherEURPrice } from '@/hooks/useFiatPrice'
import MetamaskCard from '@/components/MetamaskCard'
import { storeAccessToken } from '@/utils/accessToken'
import { useRemoveCurrentUser } from '@/state/user/hooks'
import { useRevokeSessionMutation } from '@/state/auth/hooks'

const Balance = styled(Row)`
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  background: ${({ theme }) => theme.bg5};
`

interface SettingsProps extends React.HTMLAttributes<HTMLDivElement> {
  dispatch: () => void
}

export default function Settings({ dispatch, ...props }: SettingsProps) {
  const currentUser = useCurrentUser()

  const router = useRouter()

  const rampSdk = useRampSdk({ email: currentUser?.email, key: currentUser?.starknetAddress })

  const etherEURprice = useEtherEURPrice()
  const balance = useETHBalances([currentUser?.starknetAddress])[currentUser?.starknetAddress]

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
        <TYPE.body>Solde du compte</TYPE.body>
        <Balance>
          {etherEURprice && balance ? (
            <>
              <TYPE.body>{+balance.toFixed(4)} ETH</TYPE.body>
              <TYPE.body color="text2">({balance.multiply(Math.round(etherEURprice)).toFixed(2)} EUR)</TYPE.body>
            </>
          ) : (
            <TYPE.subtitle>Loading...</TYPE.subtitle>
          )}
        </Balance>
      </Column>
      <Column gap={26}>
        {rampSdk && (
          <TYPE.body clickable onClick={rampSdk.show}>
            Deposit
          </TYPE.body>
        )}
        <MetamaskCard />
        <Link href="/" onClick={dispatch}>
          <TYPE.body clickable>Retirer le solde</TYPE.body>
        </Link>
        <Link href="/" onClick={dispatch}>
          <TYPE.body clickable>Activité</TYPE.body>
        </Link>
        <Link href="/settings/security" onClick={dispatch}>
          <TYPE.body clickable>Sécurité</TYPE.body>
        </Link>
        <TYPE.body clickable onClick={logout}>
          Logout
        </TYPE.body>
      </Column>
    </Column>
  )
}