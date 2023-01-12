import { useCallback } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { useCurrentUser } from '@/state/user/hooks'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import Link from '@/components/Link'
import { storeAccessToken } from '@/utils/accessToken'
import { useRemoveCurrentUser } from '@/state/user/hooks'
import { useRevokeSessionMutation } from '@/state/auth/hooks'
import { useUpgradeWalletModalToggle, useWalletModalToggle } from '@/state/application/hooks'
import { useSetWalletModalMode } from '@/state/wallet/hooks'
import { WalletModalMode } from '@/state/wallet/actions'
import { ErrorCard } from '@/components/Card'
import LockedWallet from '@/components/LockedWallet'
import useNeededActions from '@/hooks/useNeededActions'

const Notifiable = styled.div<{ notifications?: number }>`
  ${({ theme, notifications = 0 }) =>
    notifications &&
    theme.before.notifications`
      ::before {
        top: -1px;
      }
    `}

  width: fit-content;
  padding-right: 16px;
`

interface SettingsProps extends React.HTMLAttributes<HTMLDivElement> {
  dispatch: () => void
}

export default function Settings({ dispatch, ...props }: SettingsProps) {
  const currentUser = useCurrentUser()
  const router = useRouter()

  // needed actions
  const neededActions = useNeededActions()

  // Modals
  const toggleUpgradeWalletModal = useUpgradeWalletModalToggle()
  const toggleWalletModal = useWalletModalToggle()
  const setWalletModalMode = useSetWalletModalMode()

  const toggleRetrieveModal = useCallback(() => {
    setWalletModalMode(WalletModalMode.RETRIEVE)
    toggleWalletModal()
  }, [toggleWalletModal])

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
      {currentUser?.starknetWallet.isLocked && (
        <ErrorCard>
          <LockedWallet />
        </ErrorCard>
      )}
      <Column gap={26}>
        {!!neededActions.upgrade && (
          <Notifiable notifications={neededActions.upgrade}>
            <TYPE.body onClick={toggleUpgradeWalletModal} clickable>
              <Trans>Upgrade wallet</Trans>
            </TYPE.body>
          </Notifiable>
        )}
        {!!neededActions.withdraw && (
          <Notifiable notifications={neededActions.withdraw}>
            <TYPE.body onClick={toggleRetrieveModal} clickable>
              <Trans>Validate withdraws</Trans>
            </TYPE.body>
          </Notifiable>
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
